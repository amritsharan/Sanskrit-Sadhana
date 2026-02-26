from typing import Any, List, Dict, no_type_check

@no_type_check
def compute_detailed_results(alignment_data: Any, ref_length: int) -> Dict[str, Any]:
    """Compute overall score and categorize errors."""
    if ref_length == 0:
        return {"score": 0, "errors": []}
        
    total_penalty: float = 0.0
    error_list: List[Dict[str, Any]] = []
    match_count: int = 0
    
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
            diag_msg: str = "Pronunciation mismatch"
            # Specific diagnoses
            if ref_obj and hyp_obj:
                r_type: Any = ref_obj.get('type')
                h_type: Any = hyp_obj.get('type')
                
                if r_type == 'vowel' and h_type == 'vowel':
                    if ref_obj.get('length') != hyp_obj.get('length'):
                        diag_msg = f"Vowel length mismatch (expected {ref_obj.get('length')}, heard {hyp_obj.get('length')})"
                        total_penalty = total_penalty + 0.5
                    else:
                        total_penalty = total_penalty + 0.8
                elif r_type == 'consonant' and h_type == 'consonant':
                    if ref_obj.get('aspiration') != hyp_obj.get('aspiration'):
                        diag_msg = f"Aspiration error (expected {ref_obj.get('aspiration')})"
                        total_penalty = total_penalty + 0.6
                    elif ref_obj.get('place') != hyp_obj.get('place'):
                        diag_msg = f"Articulation place error (expected {ref_obj.get('place')})"
                        total_penalty = total_penalty + 0.7
                    else:
                        total_penalty = total_penalty + 1.0
                else:
                    total_penalty = total_penalty + 1.2
            else:
                total_penalty = total_penalty + 1.2
                
            err_entry["description"] = diag_msg
            
        elif op_type == 'del':
            total_penalty = total_penalty + 1.5
            missing_ph: Any = ref_obj.get('ph') if ref_obj else "?"
            err_entry["description"] = f"Missing sound '{missing_ph}'"
            
        elif op_type == 'ins':
            total_penalty = total_penalty + 0.4
            extra_ph: Any = hyp_obj.get('ph') if hyp_obj else "?"
            err_entry["description"] = f"Extra sound detected: '{extra_ph}'"
            
        error_list.append(err_entry)
        
    final_raw_score: float = 100.0 - (total_penalty / float(ref_length) * 100.0)
    final_score: float = max(0.0, final_raw_score)
    
    return {
        "score": int(round(final_score)),
        "matches": match_count,
        "total_ref": ref_length,
        "errors": error_list
    }
