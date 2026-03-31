import os
import sys
import uuid
from typing import Any, Optional

# Ensure local imports work reliably
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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
MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
model: Optional[Any] = None


def get_model() -> Any:
    global model
    if model is None:
        print(f"Loading Whisper model: {MODEL_NAME}...")
        model = whisper.load_model(MODEL_NAME)
    return model

@app.get("/")
async def root() -> Any:
    return {"status": "online", "model": MODEL_NAME, "model_loaded": model is not None}

@app.post("/analyze")
async def analyze_audio(
    audio: UploadFile = File(...),
    shloka_text: str = Form(""),
    ref_text: str = Form("")
) -> Any:
    reference_text = shloka_text.strip() or ref_text.strip()

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
        result: Any = model_instance.transcribe(temp_path)
        hyp_text = result.get('text', "")
        
        # 3. G2P
        ref_phonemes = text_to_phonemes(reference_text)
        hyp_phonemes = text_to_phonemes(hyp_text)
        
        # 4. Alignment
        alignment = align_phonemes(ref_phonemes, hyp_phonemes)
        
        # 5. Scoring
        results = compute_detailed_results(alignment, len(ref_phonemes))
        
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
