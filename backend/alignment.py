from typing import Any, List, Dict, Tuple, Optional, no_type_check
import numpy as np

def phoneme_distance(p1: Any, p2: Any) -> float:
    """Calculate phonetic distance between two phoneme objects."""
    if not p1 or not p2:
        return 2.0
        
    ph1: Optional[str] = p1.get('ph')
    ph2: Optional[str] = p2.get('ph')
    
    if ph1 == ph2:
        return 0.0
    
    dist_cost: float = 0.0
    # Penalty for type mismatch (vowel vs consonant)
    if p1.get('type') != p2.get('type'):
        return 2.0
        
    # Penalty for place mismatch
    if p1.get('place') != p2.get('place'):
        dist_cost = dist_cost + 0.8
        
    # Penalty for aspiration mismatch
    if p1.get('aspiration') != p2.get('aspiration'):
        dist_cost = dist_cost + 0.5
        
    # Penalty for voicing mismatch
    if p1.get('voicing') != p2.get('voicing'):
        dist_cost = dist_cost + 0.5
        
    # Penalty for vowel length mismatch
    if p1.get('length') != p2.get('length'):
        dist_cost = dist_cost + 0.4
        
    return min(dist_cost, 1.5)

@no_type_check
def align_phonemes(ref_seq: List[Any], hyp_seq: List[Any]) -> List[Dict[str, Any]]:
    """Align ref and hyp sequences using DTW."""
    n_ref: int = len(ref_seq)
    m_hyp: int = len(hyp_seq)
    
    # Cast to float to avoid issues with infinity/dtype inference from IDE
    dtw_matrix = np.full((n_ref + 1, m_hyp + 1), 999.0, dtype=float)
    dtw_matrix[0, 0] = 0.0
    
    for i in range(1, n_ref + 1):
        for j in range(1, m_hyp + 1):
            base_cost: float = phoneme_distance(ref_seq[i-1], hyp_seq[j-1])
            dtw_matrix[i, j] = base_cost + min(dtw_matrix[i-1, j], dtw_matrix[i, j-1], dtw_matrix[i-1, j-1])
            
    # Backtrack path
    idx_i: int = n_ref
    idx_j: int = m_hyp
    alignment_path: List[Dict[str, Any]] = []
    
    while idx_i > 0 or idx_j > 0:
        if idx_i > 0 and idx_j > 0:
            costs: List[float] = [dtw_matrix[idx_i-1, idx_j-1], dtw_matrix[idx_i-1, idx_j], dtw_matrix[idx_i, idx_j-1]]
            best_move: int = int(np.argmin(costs))
            
            if best_move == 0: # Match/Substitution
                step_dist: float = phoneme_distance(ref_seq[idx_i-1], hyp_seq[idx_j-1])
                operation: str = "match" if step_dist == 0.0 else "sub"
                alignment_path.append({
                    "op": operation, 
                    "ref": ref_seq[idx_i-1], 
                    "hyp": hyp_seq[idx_j-1], 
                    "ref_idx": idx_i-1
                })
                idx_i, idx_j = idx_i-1, idx_j-1
            elif best_move == 1: # Deletion
                alignment_path.append({
                    "op": "del", 
                    "ref": ref_seq[idx_i-1], 
                    "hyp": None, 
                    "ref_idx": idx_i-1
                })
                idx_i -= 1
            else: # Insertion
                alignment_path.append({
                    "op": "ins", 
                    "ref": None, 
                    "hyp": hyp_seq[idx_j-1], 
                    "ref_idx": None
                })
                idx_j -= 1
        elif idx_i > 0:
            alignment_path.append({
                "op": "del", 
                "ref": ref_seq[idx_i-1], 
                "hyp": None, 
                "ref_idx": idx_i-1
            })
            idx_i -= 1
        else:
            alignment_path.append({
                "op": "ins", 
                "ref": None, 
                "hyp": hyp_seq[idx_j-1], 
                "ref_idx": None
            })
            idx_j -= 1
            
    alignment_path.reverse()
    return alignment_path
