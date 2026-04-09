from typing import Any, List, Dict, Tuple, no_type_check


def _phoneme_similarity(p1: Any, p2: Any) -> float:
    """Return similarity in [0, 1], where 1 means exact or very close match."""
    if not p1 or not p2:
        return 0.0

    if p1.get("ph") == p2.get("ph"):
        return 1.0

    # Cross-class substitutions (vowel <-> consonant) are usually far apart.
    if p1.get("type") != p2.get("type"):
        return 0.0

    score = 1.0

    if p1.get("place") != p2.get("place"):
        score = score - 0.35
    if p1.get("aspiration") != p2.get("aspiration"):
        score = score - 0.2
    if p1.get("voicing") != p2.get("voicing"):
        score = score - 0.2
    if p1.get("length") != p2.get("length"):
        score = score - 0.15

    return max(0.0, min(1.0, score))


def _safe_div(numerator: float, denominator: float) -> float:
    if denominator <= 0.0:
        return 0.0
    return numerator / denominator


def _clip_0_100(value: float) -> float:
    return max(0.0, min(100.0, value))


def _is_vowel(obj: Any) -> bool:
    return bool(obj) and obj.get("type") == "vowel"


def _error_category_and_tip(ref_obj: Any, hyp_obj: Any) -> Tuple[str, str]:
    if not ref_obj or not hyp_obj:
        return (
            "substitution_generic",
            "Repeat the target sound slowly and match the mouth posture.",
        )

    r_type = ref_obj.get("type")
    h_type = hyp_obj.get("type")

    if r_type == "vowel" and h_type == "vowel":
        if ref_obj.get("length") != hyp_obj.get("length"):
            return (
                "vowel_length_mismatch",
                "Hold long vowels for about twice the short-vowel duration.",
            )
        return (
            "vowel_quality_mismatch",
            "Stabilize tongue and lip position for a cleaner vowel quality.",
        )

    if r_type == "consonant" and h_type == "consonant":
        if ref_obj.get("aspiration") != hyp_obj.get("aspiration"):
            return (
                "aspiration_mismatch",
                "Practice breath release contrast between alpaprana and mahaprana.",
            )
        if ref_obj.get("place") != hyp_obj.get("place"):
            return (
                "place_mismatch",
                "Adjust tongue contact point to the correct articulation place.",
            )
        if ref_obj.get("voicing") != hyp_obj.get("voicing"):
            return (
                "voicing_mismatch",
                "Check vocal fold vibration for voiced vs unvoiced contrast.",
            )
        return (
            "consonant_quality_mismatch",
            "Repeat the consonant in minimal pairs to sharpen contrast.",
        )

    return (
        "cross_class_substitution",
        "Avoid replacing vowels with consonants (or vice versa); articulate clearly.",
    )


def _compute_component_scores(
    alignment_data: Any,
    ref_length: int,
    base_score: float,
    word_mismatch_count: int,
    near_match_count: int,
    match_count: int,
) -> Dict[str, Any]:
    vowel_ref_count = 0
    vowel_length_errors = 0
    rhythm_disruptions = 0
    unknown_hyp_count = 0

    for step in alignment_data:
        op_type = step.get("op")
        ref_obj = step.get("ref")
        hyp_obj = step.get("hyp")

        if hyp_obj and hyp_obj.get("type") == "unknown":
            unknown_hyp_count += 1

        if _is_vowel(ref_obj):
            vowel_ref_count += 1

        if op_type == "sub" and _is_vowel(ref_obj) and _is_vowel(hyp_obj):
            if ref_obj.get("length") != hyp_obj.get("length"):
                vowel_length_errors += 1

        if op_type == "del" and _is_vowel(ref_obj):
            vowel_length_errors += 1

        if op_type in ("del", "ins"):
            rhythm_disruptions += 1

    vowel_length_accuracy = 1.0 - _safe_div(float(vowel_length_errors), float(vowel_ref_count))
    vowel_length_accuracy = max(0.0, min(1.0, vowel_length_accuracy))

    rhythm_accuracy = 1.0 - _safe_div(float(rhythm_disruptions), float(ref_length))
    rhythm_accuracy = max(0.0, min(1.0, rhythm_accuracy))

    lexical_accuracy = 1.0 - _safe_div(float(word_mismatch_count), max(1.0, float(word_mismatch_count + 6.0)))
    lexical_accuracy = max(0.0, min(1.0, lexical_accuracy))

    articulation_score = _clip_0_100(base_score)
    prosody_score = _clip_0_100((vowel_length_accuracy * 65.0) + (rhythm_accuracy * 35.0))
    lexical_score = _clip_0_100(lexical_accuracy * 100.0)

    # Weighted score designed for research reporting and ablation.
    combined_novel_score = _clip_0_100(
        (0.62 * articulation_score)
        + (0.28 * prosody_score)
        + (0.10 * lexical_score)
    )

    alignment_quality = _safe_div(float(match_count + int(round(0.8 * near_match_count))), float(ref_length))
    unknown_ratio = _safe_div(float(unknown_hyp_count), float(max(1, len(alignment_data))))
    confidence = max(0.05, min(0.99, 0.15 + (0.75 * alignment_quality) - (0.35 * unknown_ratio)))

    if confidence < 0.45:
        uncertainty = "high"
    elif confidence < 0.7:
        uncertainty = "medium"
    else:
        uncertainty = "low"

    return {
        "component_scores": {
            "articulation": int(round(articulation_score)),
            "prosody": int(round(prosody_score)),
            "lexical": int(round(lexical_score)),
            "combined_novel": int(round(combined_novel_score)),
        },
        "prosody_metrics": {
            "vowel_ref_count": vowel_ref_count,
            "vowel_length_errors": vowel_length_errors,
            "rhythm_disruptions": rhythm_disruptions,
            "vowel_length_accuracy": round(vowel_length_accuracy, 4),
            "rhythm_accuracy": round(rhythm_accuracy, 4),
        },
        "confidence": round(confidence, 4),
        "uncertainty": uncertainty,
        "abstain_recommended": confidence < 0.45,
    }

@no_type_check
def compute_detailed_results(
    alignment_data: Any,
    ref_length: int,
    word_mismatch_count: int = 0,
) -> Dict[str, Any]:
    """Compute overall score and categorize errors."""
    if ref_length == 0:
        return {"score": 0, "errors": []}
        
    total_penalty: float = 0.0
    error_list: List[Dict[str, Any]] = []
    category_counts: Dict[str, int] = {}
    match_count: int = 0
    near_match_count: int = 0
    substitution_count: int = 0
    deletion_count: int = 0
    insertion_count: int = 0
    
    for align_step in alignment_data:
        op_type: Any = align_step.get('op')
        
        if op_type == 'match':
            match_count = match_count + 1
            continue
            
        ref_obj: Any = align_step.get('ref')
        hyp_obj: Any = align_step.get('hyp')
        
        err_entry: Dict[str, Any] = {
            "type": op_type,
            "ref_ph": ref_obj.get('ph') if ref_obj else None,
            "hyp_ph": hyp_obj.get('ph') if hyp_obj else None,
            "ref_idx": align_step.get('ref_idx')
        }
        
        if op_type == 'sub':
            substitution_count = substitution_count + 1
            diag_msg: str = "Pronunciation mismatch"
            category = "substitution_generic"
            tip = "Repeat the target sound slowly and compare with model recitation."
            # Specific diagnoses
            if ref_obj and hyp_obj:
                similarity = _phoneme_similarity(ref_obj, hyp_obj)
                r_type: Any = ref_obj.get('type')
                h_type: Any = hyp_obj.get('type')

                if similarity >= 0.8:
                    near_match_count = near_match_count + 1
                    diag_msg = "Minor pronunciation variation (near match)"
                    category = "near_match"
                    tip = "Small variation only; keep a steady articulation and rhythm."
                    total_penalty = total_penalty + 0.08
                elif similarity >= 0.55:
                    near_match_count = near_match_count + 1
                    diag_msg = "Close phoneme substitution"
                    category = "close_substitution"
                    tip = "Practice this sound pair in short repetition drills."
                    total_penalty = total_penalty + 0.2
                elif r_type == 'vowel' and h_type == 'vowel':
                    if ref_obj.get('length') != hyp_obj.get('length'):
                        diag_msg = f"Vowel length mismatch (expected {ref_obj.get('length')}, heard {hyp_obj.get('length')})"
                        category = "vowel_length_mismatch"
                        tip = "Hold long vowels roughly twice the duration of short vowels."
                        total_penalty = total_penalty + 0.28
                    else:
                        category = "vowel_quality_mismatch"
                        tip = "Refine vowel mouth shape for stable resonance."
                        total_penalty = total_penalty + 0.4
                elif r_type == 'consonant' and h_type == 'consonant':
                    if ref_obj.get('aspiration') != hyp_obj.get('aspiration'):
                        diag_msg = f"Aspiration error (expected {ref_obj.get('aspiration')})"
                        category = "aspiration_mismatch"
                        tip = "Contrast breathy vs non-breathy release with minimal pairs."
                        total_penalty = total_penalty + 0.32
                    elif ref_obj.get('place') != hyp_obj.get('place'):
                        diag_msg = f"Articulation place error (expected {ref_obj.get('place')})"
                        category = "place_mismatch"
                        tip = "Shift tongue placement to the expected articulation point."
                        total_penalty = total_penalty + 0.4
                    else:
                        category = "consonant_substitution"
                        tip = "Repeat the consonant cluster slowly before full-speed chanting."
                        total_penalty = total_penalty + 0.5
                else:
                    category, tip = _error_category_and_tip(ref_obj, hyp_obj)
                    total_penalty = total_penalty + 0.65
            else:
                total_penalty = total_penalty + 0.65
                category, tip = _error_category_and_tip(ref_obj, hyp_obj)
                
            err_entry["description"] = diag_msg
            err_entry["category"] = category
            err_entry["tip"] = tip
            category_counts[category] = int(category_counts.get(category, 0) + 1)
            
        elif op_type == 'del':
            deletion_count = deletion_count + 1
            total_penalty = total_penalty + 0.62
            missing_ph: Any = ref_obj.get('ph') if ref_obj else "?"
            err_entry["description"] = f"Missing sound '{missing_ph}'"
            err_entry["category"] = "deletion"
            err_entry["tip"] = "Do not skip this sound; chant slowly with clear segmentation."
            category_counts["deletion"] = int(category_counts.get("deletion", 0) + 1)
            
        elif op_type == 'ins':
            insertion_count = insertion_count + 1
            total_penalty = total_penalty + 0.12
            extra_ph: Any = hyp_obj.get('ph') if hyp_obj else "?"
            err_entry["description"] = f"Extra sound detected: '{extra_ph}'"
            err_entry["category"] = "insertion"
            err_entry["tip"] = "Avoid adding transitional sounds between syllables."
            category_counts["insertion"] = int(category_counts.get("insertion", 0) + 1)
            
        error_list.append(err_entry)
        
    final_raw_score: float = 100.0 - (total_penalty / float(ref_length) * 100.0)

    # Keep scoring encouraging: partial correctness should still receive visible credit.
    relevance_ratio = (match_count + (0.8 * near_match_count)) / float(ref_length)
    leniency_bonus = min(25.0, (relevance_ratio * 18.0) + (near_match_count * 0.9))
    adjusted_score = final_raw_score + leniency_bonus

    min_relevance_score = 0.0
    if relevance_ratio > 0.0:
        min_relevance_score = 35.0 + (relevance_ratio * 52.0)

    final_score: float = max(0.0, adjusted_score, min_relevance_score)

    # Encourage users strongly when most sounds are correct.
    if relevance_ratio >= 0.75:
        final_score = max(final_score, 90.0)
    if relevance_ratio >= 0.88:
        final_score = max(final_score, 95.0)

    # Penalize word-level mismatches, but soften the deduction when overall
    # recitation consistency is high.
    if word_mismatch_count > 0:
        consistency_ratio = (match_count + (0.7 * near_match_count)) / float(ref_length)
        consistency_factor = max(0.45, 1.05 - (0.6 * consistency_ratio))
        lexical_penalty = min(16.0, float(word_mismatch_count) * 6.0 * consistency_factor)
        final_score = final_score - lexical_penalty

    # Prevent inflated perfect scores for almost-correct attempts while keeping
    # a natural score spread across 90-100 for good recitation.
    # Keep 100 only for truly perfect alignment.
    is_perfect = (
        match_count == ref_length
        and near_match_count == 0
        and len(error_list) == 0
        and word_mismatch_count == 0
    )
    if not is_perfect:
        issue_count = len(error_list)
        issue_ratio = issue_count / float(ref_length)
        near_ratio = near_match_count / float(ref_length)

        # Smoothly lower the maximum achievable score based on detected issues.
        # This avoids a rigid 97/98/99-only band and allows broad 90-99 outcomes.
        deduction = (issue_ratio * 18.0) + (near_ratio * 8.0)
        score_ceiling = max(90.0, 99.6 - deduction)
        final_score = min(final_score, score_ceiling)

    final_score = min(100.0, final_score)

    components = _compute_component_scores(
        alignment_data=alignment_data,
        ref_length=ref_length,
        base_score=final_score,
        word_mismatch_count=word_mismatch_count,
        near_match_count=near_match_count,
        match_count=match_count,
    )
    combined_score = components["component_scores"]["combined_novel"]

    ref_mismatch_count = substitution_count + deletion_count
    
    return {
        "score": int(round(combined_score)),
        "base_pronunciation_score": int(round(final_score)),
        "matches": match_count,
        "near_matches": near_match_count,
        "total_ref": ref_length,
        "errors": error_list,
        "error_summary": category_counts,
        "ref_mismatches": ref_mismatch_count,
        "method": "prosody_explainable_v1",
        "component_scores": components["component_scores"],
        "prosody_metrics": components["prosody_metrics"],
        "confidence": components["confidence"],
        "uncertainty": components["uncertainty"],
        "abstain_recommended": components["abstain_recommended"],
        "op_counts": {
            "sub": substitution_count,
            "del": deletion_count,
            "ins": insertion_count,
        },
    }
