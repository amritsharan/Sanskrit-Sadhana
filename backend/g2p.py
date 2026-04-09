from typing import List, Dict, Any, Union, Optional, cast, Tuple

# Phoneme Feature Matrix
# type: vowel|consonant
# length: hrasva|dirgha|pluta
# place: kanthya (velar), talavya (palatal), murdhanya (retroflex), dantya (dental), oshthya (labial)
# aspiration: alpaprana|mahaprana
# voicing: aghosha (unvoiced)|ghoshavat (voiced)

# Use a more flexible type for the dictionary values to avoid linting issues with heterogeneous keys
PhonemeInfo = Dict[str, Any]

PHONEME_DATA: Dict[str, PhonemeInfo] = {
    # Vowels
    'a': {'ph': 'a', 'type': 'vowel', 'length': 'hrasva', 'place': 'kanthya'},
    'ā': {'ph': 'aː', 'type': 'vowel', 'length': 'dirgha', 'place': 'kanthya'},
    'i': {'ph': 'i', 'type': 'vowel', 'length': 'hrasva', 'place': 'talavya'},
    'ī': {'ph': 'iː', 'type': 'vowel', 'length': 'dirgha', 'place': 'talavya'},
    'u': {'ph': 'u', 'type': 'vowel', 'length': 'hrasva', 'place': 'oshthya'},
    'ū': {'ph': 'uː', 'type': 'vowel', 'length': 'dirgha', 'place': 'oshthya'},
    'ṛ': {'ph': 'r̩', 'type': 'vowel', 'length': 'hrasva', 'place': 'murdhanya'},
    'ṝ': {'ph': 'r̩ː', 'type': 'vowel', 'length': 'dirgha', 'place': 'murdhanya'},
    'e': {'ph': 'e', 'type': 'vowel', 'length': 'dirgha', 'place': 'talavya'},
    'ai': {'ph': 'ai', 'type': 'vowel', 'length': 'dirgha', 'place': 'talavya'},
    'o': {'ph': 'o', 'type': 'vowel', 'length': 'dirgha', 'place': 'oshthya'},
    'au': {'ph': 'au', 'type': 'vowel', 'length': 'dirgha', 'place': 'oshthya'},
    
    # Consonants - Velar
    'k': {'ph': 'k', 'type': 'consonant', 'place': 'kanthya', 'aspiration': 'alpaprana', 'voicing': 'aghosha'},
    'kʰ': {'ph': 'kʰ', 'type': 'consonant', 'place': 'kanthya', 'aspiration': 'mahaprana', 'voicing': 'aghosha'},
    'g': {'ph': 'g', 'type': 'consonant', 'place': 'kanthya', 'aspiration': 'alpaprana', 'voicing': 'ghoshavat'},
    'gʰ': {'ph': 'gʰ', 'type': 'consonant', 'place': 'kanthya', 'aspiration': 'mahaprana', 'voicing': 'ghoshavat'},
    'ŋ': {'ph': 'ŋ', 'type': 'consonant', 'place': 'kanthya', 'voicing': 'ghoshavat', 'nasal': True},

    # Consonants - Palatal
    'c': {'ph': 'c', 'type': 'consonant', 'place': 'talavya', 'aspiration': 'alpaprana', 'voicing': 'aghosha'},
    'cʰ': {'ph': 'cʰ', 'type': 'consonant', 'place': 'talavya', 'aspiration': 'mahaprana', 'voicing': 'aghosha'},
    'j': {'ph': 'j', 'type': 'consonant', 'place': 'talavya', 'aspiration': 'alpaprana', 'voicing': 'ghoshavat'},
    'jʰ': {'ph': 'jʰ', 'type': 'consonant', 'place': 'talavya', 'aspiration': 'mahaprana', 'voicing': 'ghoshavat'},
    'ɲ': {'ph': 'ɲ', 'type': 'consonant', 'place': 'talavya', 'voicing': 'ghoshavat', 'nasal': True},

    # Consonants - Retroflex
    'ʈ': {'ph': 'ʈ', 'type': 'consonant', 'place': 'murdhanya', 'aspiration': 'alpaprana', 'voicing': 'aghosha'},
    'ʈʰ': {'ph': 'ʈʰ', 'type': 'consonant', 'place': 'murdhanya', 'aspiration': 'mahaprana', 'voicing': 'aghosha'},
    'ɖ': {'ph': 'ɖ', 'type': 'consonant', 'place': 'murdhanya', 'aspiration': 'alpaprana', 'voicing': 'ghoshavat'},
    'ɖʰ': {'ph': 'ɖʰ', 'type': 'consonant', 'place': 'murdhanya', 'aspiration': 'mahaprana', 'voicing': 'ghoshavat'},
    'ɳ': {'ph': 'ɳ', 'type': 'consonant', 'place': 'murdhanya', 'voicing': 'ghoshavat', 'nasal': True},

    # Consonants - Dental
    't': {'ph': 't', 'type': 'consonant', 'place': 'dantya', 'aspiration': 'alpaprana', 'voicing': 'aghosha'},
    'tʰ': {'ph': 'tʰ', 'type': 'consonant', 'place': 'dantya', 'aspiration': 'mahaprana', 'voicing': 'aghosha'},
    'd': {'ph': 'd', 'type': 'consonant', 'place': 'dantya', 'aspiration': 'alpaprana', 'voicing': 'ghoshavat'},
    'dʰ': {'ph': 'dʰ', 'type': 'consonant', 'place': 'dantya', 'aspiration': 'mahaprana', 'voicing': 'ghoshavat'},
    'n': {'ph': 'n', 'type': 'consonant', 'place': 'dantya', 'voicing': 'ghoshavat', 'nasal': True},

    # Consonants - Labial
    'p': {'ph': 'p', 'type': 'consonant', 'place': 'oshthya', 'aspiration': 'alpaprana', 'voicing': 'aghosha'},
    'pʰ': {'ph': 'pʰ', 'type': 'consonant', 'place': 'oshthya', 'aspiration': 'mahaprana', 'voicing': 'aghosha'},
    'b': {'ph': 'b', 'type': 'consonant', 'place': 'oshthya', 'aspiration': 'alpaprana', 'voicing': 'ghoshavat'},
    'bʰ': {'ph': 'bʰ', 'type': 'consonant', 'place': 'oshthya', 'aspiration': 'mahaprana', 'voicing': 'ghoshavat'},
    'm': {'ph': 'm', 'type': 'consonant', 'place': 'oshthya', 'voicing': 'ghoshavat', 'nasal': True},
    
    'y': {'ph': 'j', 'type': 'consonant', 'place': 'talavya', 'voicing': 'ghoshavat'},
    'r': {'ph': 'r', 'type': 'consonant', 'place': 'murdhanya', 'voicing': 'ghoshavat'},
    'l': {'ph': 'l', 'type': 'consonant', 'place': 'dantya', 'voicing': 'ghoshavat'},
    'v': {'ph': 'ʋ', 'type': 'consonant', 'place': 'dantya-oshthya', 'voicing': 'ghoshavat'},
    'ś': {'ph': 'ʃ', 'type': 'consonant', 'place': 'talavya', 'voicing': 'aghosha'},
    'ṣ': {'ph': 'ʂ', 'type': 'consonant', 'place': 'murdhanya', 'voicing': 'aghosha'},
    's': {'ph': 's', 'type': 'consonant', 'place': 'dantya', 'voicing': 'aghosha'},
    'h': {'ph': 'h', 'type': 'consonant', 'place': 'kanthya', 'voicing': 'ghoshavat'},

    # Common Sanskrit markers
    'ṃ': {'ph': 'm', 'type': 'consonant', 'place': 'oshthya', 'voicing': 'ghoshavat', 'nasal': True},
    'ḥ': {'ph': 'h', 'type': 'consonant', 'place': 'kanthya', 'voicing': 'ghoshavat'},
}

DEVANAGARI_VOWELS: Dict[str, str] = {
    'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
    'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
}

DEVANAGARI_MATRAS: Dict[str, str] = {
    'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū',
    'ृ': 'ṛ', 'ॄ': 'ṝ', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
}

DEVANAGARI_CONSONANTS: Dict[str, str] = {
    'क': 'k', 'ख': 'kʰ', 'ग': 'g', 'घ': 'gʰ', 'ङ': 'ŋ',
    'च': 'c', 'छ': 'cʰ', 'ज': 'j', 'झ': 'jʰ', 'ञ': 'ɲ',
    'ट': 'ʈ', 'ठ': 'ʈʰ', 'ड': 'ɖ', 'ढ': 'ɖʰ', 'ण': 'ɳ',
    'त': 't', 'थ': 'tʰ', 'द': 'd', 'ध': 'dʰ', 'न': 'n',
    'प': 'p', 'फ': 'pʰ', 'ब': 'b', 'भ': 'bʰ', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h', 'ळ': 'l',
}

DEVANAGARI_PUNCTUATION = set(['।', '॥', ',', '.', ';', ':', '!', '?', '"', "'", '(', ')', '[', ']'])
VIRAMA = '्'


def _append_phoneme(output: List[PhonemeInfo], key: str) -> None:
    phoneme = PHONEME_DATA.get(key)
    if phoneme is not None:
        output.append(phoneme)


def devanagari_to_phonemes(text: str) -> List[PhonemeInfo]:
    output: List[PhonemeInfo] = []
    i = 0

    while i < len(text):
        ch = text[i]

        if ch.isspace() or ch in DEVANAGARI_PUNCTUATION:
            i += 1
            continue

        if ch in DEVANAGARI_VOWELS:
            _append_phoneme(output, DEVANAGARI_VOWELS[ch])
            i += 1
            continue

        if ch in ('ं', 'ँ'):
            _append_phoneme(output, 'ṃ')
            i += 1
            continue

        if ch == 'ः':
            _append_phoneme(output, 'ḥ')
            i += 1
            continue

        if ch in DEVANAGARI_CONSONANTS:
            consonant_key = DEVANAGARI_CONSONANTS[ch]
            _append_phoneme(output, consonant_key)

            next_char = text[i + 1] if i + 1 < len(text) else ''

            if next_char == VIRAMA:
                i += 2
                continue

            if next_char in DEVANAGARI_MATRAS:
                _append_phoneme(output, DEVANAGARI_MATRAS[next_char])
                i += 2
                continue

            # Inherent schwa for bare consonants.
            _append_phoneme(output, 'a')
            i += 1
            continue

        i += 1

    return output

# Common transliteration maps
REPLACEMENTS: List[Tuple[str, str]] = [
    ("kh", "kʰ"), ("gh", "gʰ"), ("ch", "cʰ"), ("jh", "jʰ"),
    ("ṭh", "ʈʰ"), ("ḍh", "ɖʰ"), ("th", "tʰ"), ("dh", "dʰ"),
    ("ph", "pʰ"), ("bh", "bʰ"), ("ai", "ai"), ("au", "au"),
    ("sh", "ś"), ("shh", "ṣ")
]

def text_to_phonemes(text: str) -> List[PhonemeInfo]:
    """Convert IAST/Latin transliteration to detailed phoneme objects."""
    if any('\u0900' <= ch <= '\u097F' for ch in str(text)):
        return devanagari_to_phonemes(str(text))

    clean_text: str = str(text).strip().lower()
    for pattern, replacement in REPLACEMENTS:
        clean_text = clean_text.replace(pattern, ' ' + replacement + ' ')
    
    # Cleaning punctuation
    for punct in ",.!?;:()[]\"'":
        clean_text = clean_text.replace(punct, ' ')
        
    tokens: List[str] = clean_text.split()
    output_phonemes: List[PhonemeInfo] = []
    
    for token in tokens:
        # Explicitly ensure token is recognized as a string
        target_token: str = str(token)
        
        # Check for multi-char or pre-mapped
        if target_token in PHONEME_DATA:
            output_phonemes.append(PHONEME_DATA[target_token])
            continue
            
        for char_token in target_token:
            mapped_ph: Optional[PhonemeInfo] = PHONEME_DATA.get(char_token)
            if mapped_ph is not None:
                output_phonemes.append(mapped_ph)
            else:
                output_phonemes.append({'ph': str(char_token), 'type': 'unknown'})
                
    return output_phonemes
