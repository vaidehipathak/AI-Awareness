from typing import Dict, Any, List
import re

def detect(processed_text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Heuristic-based AI text detector.
    Uses linguistic patterns and statistical analysis to detect AI-generated content.
    """
    if not processed_text or len(processed_text.strip()) < 50:
        return {
            "detection_type": "text_pdf",
            "confidence_score": 0.0,
            "flags": [],
            "short_explanation": "Text too short for analysis.",
        }
    
    flags = []
    score = 0.0
    
    # Heuristic 1: Repetitive sentence structure (AI tends to be formulaic)
    sentences = re.split(r'[.!?]+', processed_text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    if len(sentences) >= 3:
        # Check for similar sentence lengths (AI often generates uniform sentences)
        lengths = [len(s.split()) for s in sentences]
        avg_len = sum(lengths) / len(lengths)
        variance = sum((l - avg_len) ** 2 for l in lengths) / len(lengths)
        
        if variance < 10:  # Low variance = uniform sentences
            score += 0.15
            flags.append("uniform_sentence_structure")
    
    # Heuristic 2: Overuse of transition words (AI loves connectors)
    transition_words = r'\b(however|moreover|furthermore|additionally|consequently|therefore|thus|hence|nevertheless|nonetheless)\b'
    transition_count = len(re.findall(transition_words, processed_text.lower()))
    
    if transition_count > len(sentences) * 0.3:  # More than 30% of sentences have transitions
        score += 0.20
        flags.append("excessive_transitions")
    
    # Heuristic 3: Lack of personal pronouns (AI avoids first-person)
    personal_pronouns = r'\b(I|me|my|mine|we|us|our|ours)\b'
    pronoun_count = len(re.findall(personal_pronouns, processed_text, re.IGNORECASE))
    
    if pronoun_count < len(sentences) * 0.1:  # Less than 10% personal pronouns
        score += 0.15
        flags.append("impersonal_tone")
    
    # Heuristic 4: Repetitive vocabulary (AI reuses words)
    words = re.findall(r'\b\w{4,}\b', processed_text.lower())
    if len(words) > 20:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.5:  # Less than 50% unique words
            score += 0.20
            flags.append("repetitive_vocabulary")
    
    # Heuristic 5: Perfect grammar with no typos (AI is too perfect)
    # Check for common human errors (missing - AI rarely makes these)
    human_markers = r'(?:gonna|wanna|kinda|sorta|yeah|nah|ok|okay)'
    informal_count = len(re.findall(human_markers, processed_text.lower()))
    
    if informal_count == 0 and len(processed_text) > 200:
        score += 0.15
        flags.append("overly_formal")
    
    # Heuristic 6: Generic/vague language
    vague_terms = r'\b(various|numerous|several|many|some|certain|particular|specific)\b'
    vague_count = len(re.findall(vague_terms, processed_text.lower()))
    
    if vague_count > len(sentences) * 0.4:
        score += 0.15
        flags.append("vague_language")
    
    # Cap score at 1.0
    final_score = min(score, 1.0)
    
    # Determine explanation
    if final_score < 0.3:
        explanation = "Text appears human-written with natural variation."
    elif final_score < 0.6:
        explanation = "Text shows some AI-like patterns but inconclusive."
    else:
        explanation = "Text exhibits multiple AI-generated characteristics."
    
    return {
        "detection_type": "text_pdf",
        "confidence_score": round(final_score, 2),
        "flags": flags,
        "short_explanation": explanation,
    }
