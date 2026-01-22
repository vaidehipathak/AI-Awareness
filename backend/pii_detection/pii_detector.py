from regex_patterns import detect_regex_pii
from ner_detector import detect_ner_pii

def detect_pii(text):
    return {
        "regex_pii": detect_regex_pii(text),
        "ner_pii": detect_ner_pii(text)
    }
