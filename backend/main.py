import os
import re
import sys
import uuid
from typing import Any, Optional

# Ensure local imports work reliably
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import whisper
from g2p import text_to_phonemes
from alignment import align_phonemes
from scoring import compute_detailed_results

app = FastAPI(title="Sanskrit Sadhana Analysis Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Render free tier is memory-constrained, so default to a smaller model.
# You can override this in hosting settings with WHISPER_MODEL=base, small, etc.
MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
model: Optional[Any] = None
translation_model_name = os.getenv("SANSKRIT_TRANSLATION_MODEL", "facebook/nllb-200-distilled-600M")
translation_source_lang = os.getenv("SANSKRIT_SOURCE_LANG", "san_Deva")
translation_target_lang = os.getenv("SANSKRIT_TARGET_LANG", "eng_Latn")
translation_tokenizer: Optional[Any] = None
translation_model: Optional[Any] = None
translation_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class MeaningRequest(BaseModel):
    text: str


def get_model() -> Any:
    global model
    if model is None:
        print(f"Loading Whisper model: {MODEL_NAME}...")
        model = whisper.load_model(MODEL_NAME)
    return model


def get_translation_model() -> tuple[Any, Any]:
    global translation_model, translation_tokenizer

    if translation_model is None or translation_tokenizer is None:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        print(f"Loading Sanskrit translation model: {translation_model_name}...")
        translation_tokenizer = AutoTokenizer.from_pretrained(translation_model_name)
        translation_model = AutoModelForSeq2SeqLM.from_pretrained(translation_model_name)
        translation_model.to(translation_device)
        translation_model.eval()

    return translation_tokenizer, translation_model


def normalize_translation_input(text: str) -> str:
    return " ".join(text.replace("\r", "\n").split()).strip()


def split_translation_segments(text: str) -> list[str]:
    normalized = text.replace("\r", "\n")
    raw_segments = []

    for line in normalized.split("\n"):
        for segment in line.replace("॥", "|").replace("।", "|").split("|"):
            cleaned = segment.strip()
            if cleaned:
                raw_segments.append(cleaned)

    return raw_segments or [normalize_translation_input(text)]


def translate_segment(segment: str) -> str:
    tokenizer, translation_engine = get_translation_model()
    source_text = normalize_translation_input(segment)

    if not source_text:
        return ""

    tokenizer.src_lang = translation_source_lang
    encoded = tokenizer(
        source_text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
    )
    encoded = {key: value.to(translation_device) for key, value in encoded.items()}

    forced_bos_token_id = None
    if hasattr(tokenizer, "lang_code_to_id") and translation_target_lang in tokenizer.lang_code_to_id:
        forced_bos_token_id = tokenizer.lang_code_to_id[translation_target_lang]

    generated = translation_engine.generate(
        **encoded,
        max_new_tokens=128,
        num_beams=4,
        forced_bos_token_id=forced_bos_token_id,
    )

    translated = tokenizer.batch_decode(generated, skip_special_tokens=True)[0].strip()
    return translated


def translate_sanskrit_text(text: str) -> str:
    cleaned = normalize_translation_input(text)
    if not cleaned:
        return ""

    segments = split_translation_segments(cleaned)
    translated_segments = []

    for segment in segments:
        translated = translate_segment(segment)
        if translated:
            translated_segments.append(translated)

    return " ".join(translated_segments).strip()


def build_word_feedback(reference_text: str, alignment_data: Any) -> list[dict[str, Any]]:
    """Map phoneme-level alignment issues to words in the reference text."""
    words = tokenize_words(reference_text)
    if not words:
        return []

    ranges: list[dict[str, Any]] = []
    cursor = 0

    for idx, word in enumerate(words):
        phoneme_count = len(text_to_phonemes(word))
        if phoneme_count <= 0:
            continue

        start_idx = cursor
        end_idx = cursor + phoneme_count - 1
        ranges.append(
            {
                "word_index": idx,
                "word": word,
                "start": start_idx,
                "end": end_idx,
                "issue_count": 0,
            }
        )
        cursor += phoneme_count

    for step in alignment_data:
        if step.get("op") == "match":
            continue

        ref_idx = step.get("ref_idx")
        if ref_idx is None:
            continue

        for word_range in ranges:
            if word_range["start"] <= ref_idx <= word_range["end"]:
                word_range["issue_count"] += 1
                break

    feedback: list[dict[str, Any]] = []
    for word_range in ranges:
        issue_count = int(word_range["issue_count"])
        if issue_count <= 0:
            continue

        if issue_count >= 3:
            severity = "high"
        elif issue_count == 2:
            severity = "medium"
        else:
            severity = "low"

        feedback.append(
            {
                "word": word_range["word"],
                "word_index": word_range["word_index"],
                "issue_count": issue_count,
                "severity": severity,
            }
        )

    feedback.sort(key=lambda item: item["issue_count"], reverse=True)
    return feedback


def tokenize_words(text: str) -> list[str]:
    tokens: list[str] = []
    cleaned_text = text.replace("\n", " ").strip()

    if not cleaned_text:
        return tokens

    for raw in re.split(r"\s+", cleaned_text):
        token = raw.strip().strip(".,;:!?|।॥/\\()[]{}<>\"“”‘’")
        if token:
            tokens.append(token)

    return tokens


def phoneme_key(word: str) -> str:
    phonemes = text_to_phonemes(word)
    if not phonemes:
        return word.lower()

    joined = "-".join(str(item.get("ph", "")).lower() for item in phonemes if item.get("ph"))
    return joined or word.lower()


def build_word_mismatch_feedback(reference_text: str, hypothesis_text: str) -> list[dict[str, Any]]:
    from difflib import SequenceMatcher

    ref_words = tokenize_words(reference_text)
    hyp_words = tokenize_words(hypothesis_text)

    if not ref_words:
        return []

    ref_keys = [phoneme_key(word) for word in ref_words]
    hyp_keys = [phoneme_key(word) for word in hyp_words]
    matcher = SequenceMatcher(None, ref_keys, hyp_keys, autojunk=False)

    mismatches: list[dict[str, Any]] = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue

        if tag == "replace":
            overlap = min(i2 - i1, j2 - j1)
            for offset in range(overlap):
                mismatches.append(
                    {
                        "mismatch_type": "replace",
                        "expected_word": ref_words[i1 + offset],
                        "pronounced_word": hyp_words[j1 + offset],
                        "expected_index": i1 + offset,
                        "pronounced_index": j1 + offset,
                    }
                )

            for extra_ref in range(i1 + overlap, i2):
                mismatches.append(
                    {
                        "mismatch_type": "delete",
                        "expected_word": ref_words[extra_ref],
                        "pronounced_word": None,
                        "expected_index": extra_ref,
                        "pronounced_index": None,
                    }
                )

            for extra_hyp in range(j1 + overlap, j2):
                mismatches.append(
                    {
                        "mismatch_type": "insert",
                        "expected_word": None,
                        "pronounced_word": hyp_words[extra_hyp],
                        "expected_index": None,
                        "pronounced_index": extra_hyp,
                    }
                )

        elif tag == "delete":
            for ref_idx in range(i1, i2):
                mismatches.append(
                    {
                        "mismatch_type": "delete",
                        "expected_word": ref_words[ref_idx],
                        "pronounced_word": None,
                        "expected_index": ref_idx,
                        "pronounced_index": None,
                    }
                )

        elif tag == "insert":
            for hyp_idx in range(j1, j2):
                mismatches.append(
                    {
                        "mismatch_type": "insert",
                        "expected_word": None,
                        "pronounced_word": hyp_words[hyp_idx],
                        "expected_index": None,
                        "pronounced_index": hyp_idx,
                    }
                )

    return mismatches

@app.get("/")
async def root() -> Any:
    return {
        "status": "online",
        "model": MODEL_NAME,
        "model_loaded": model is not None,
        "translation_model": translation_model_name,
        "translation_model_loaded": translation_model is not None,
    }


@app.post("/meaning")
async def meaning(request: MeaningRequest) -> Any:
    cleaned_text = request.text.strip()

    if not cleaned_text:
        return {"meaning": "", "source": "empty"}

    try:
        translated = translate_sanskrit_text(cleaned_text)
        if translated:
            return {
                "meaning": translated,
                "source": "local-model",
                "model": translation_model_name,
            }
    except Exception as exc:
        return {
            "meaning": "",
            "source": "error",
            "error": str(exc),
            "model": translation_model_name,
        }

    return {
        "meaning": "",
        "source": "unavailable",
        "model": translation_model_name,
    }

@app.post("/analyze")
async def analyze_audio(
    audio: UploadFile = File(...),
    shloka_text: str = Form(""),
    ref_text: str = Form("")
) -> Any:
    reference_text = ref_text.strip() or shloka_text.strip()

    if not reference_text:
        return {"error": "shloka_text cannot be empty"}
        
    # 1. Save temp file
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}.webm")
    
    with open(temp_path, "wb") as f:
        f.write(await audio.read())
        
    try:
        model_instance = get_model()
        # 2. Transcription
        result: Any = model_instance.transcribe(
            temp_path,
            language="sa",
            task="transcribe",
            fp16=False,
        )
        hyp_text = result.get('text', "")
        
        # 3. G2P
        ref_phonemes = text_to_phonemes(reference_text)
        hyp_phonemes = text_to_phonemes(hyp_text)
        
        # 4. Alignment
        alignment = align_phonemes(ref_phonemes, hyp_phonemes)

        # 5. Word-level mismatch detection
        word_feedback = build_word_feedback(reference_text, alignment)
        word_mismatches = build_word_mismatch_feedback(reference_text, hyp_text)
        
        # 6. Scoring
        results = compute_detailed_results(
            alignment,
            len(ref_phonemes),
            word_mismatch_count=len(word_mismatches),
        )
        results["word_feedback"] = word_feedback
        results["word_mismatches"] = word_mismatches
        
        return {
            "transcript": hyp_text,
            "score": results["score"],
            "ref_phonemes": ref_phonemes,
            "hyp_phonemes": hyp_phonemes,
            "analysis": results
        }
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
