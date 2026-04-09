from typing import Any, List, Dict, no_type_check


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
            # Specific diagnoses
            if ref_obj and hyp_obj:
                similarity = _phoneme_similarity(ref_obj, hyp_obj)
                r_type: Any = ref_obj.get('type')
                h_type: Any = hyp_obj.get('type')

                if similarity >= 0.8:
                    near_match_count = near_match_count + 1
                    diag_msg = "Minor pronunciation variation (near match)"
                    total_penalty = total_penalty + 0.08
                elif similarity >= 0.55:
                    near_match_count = near_match_count + 1
                    diag_msg = "Close phoneme substitution"
                    total_penalty = total_penalty + 0.2
                elif r_type == 'vowel' and h_type == 'vowel':
                    if ref_obj.get('length') != hyp_obj.get('length'):
                        diag_msg = f"Vowel length mismatch (expected {ref_obj.get('length')}, heard {hyp_obj.get('length')})"
                        total_penalty = total_penalty + 0.28
                    else:
                        total_penalty = total_penalty + 0.4
                elif r_type == 'consonant' and h_type == 'consonant':
                    if ref_obj.get('aspiration') != hyp_obj.get('aspiration'):
                        diag_msg = f"Aspiration error (expected {ref_obj.get('aspiration')})"
                        total_penalty = total_penalty + 0.32
                    elif ref_obj.get('place') != hyp_obj.get('place'):
                        diag_msg = f"Articulation place error (expected {ref_obj.get('place')})"
                        total_penalty = total_penalty + 0.4
                    else:
                        total_penalty = total_penalty + 0.5
                else:
                    total_penalty = total_penalty + 0.65
            else:
                total_penalty = total_penalty + 0.65
                
            err_entry["description"] = diag_msg
            
        elif op_type == 'del':
            deletion_count = deletion_count + 1
            total_penalty = total_penalty + 0.62
            missing_ph: Any = ref_obj.get('ph') if ref_obj else "?"
            err_entry["description"] = f"Missing sound '{missing_ph}'"
            
        elif op_type == 'ins':
            insertion_count = insertion_count + 1
            total_penalty = total_penalty + 0.12
            extra_ph: Any = hyp_obj.get('ph') if hyp_obj else "?"
            err_entry["description"] = f"Extra sound detected: '{extra_ph}'"
            
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

    ref_mismatch_count = substitution_count + deletion_count
    
    return {
        "score": int(round(final_score)),
        "matches": match_count,
        "near_matches": near_match_count,
        "total_ref": ref_length,
        "errors": error_list,
        "ref_mismatches": ref_mismatch_count,
        "op_counts": {
            "sub": substitution_count,
            "del": deletion_count,
            "ins": insertion_count,
        },
    }
