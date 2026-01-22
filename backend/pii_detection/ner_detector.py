import spacy

nlp = spacy.load("en_core_web_sm")

ALLOWED_ENTITIES = {"PERSON", "GPE", "ORG"}
EXCLUDED_TERMS = {"otp", "pin", "code"}

def ner_candidates(text):
    doc = nlp(text)
    results = []

    for ent in doc.ents:
        if ent.label_ in ALLOWED_ENTITIES:
            if ent.text.lower() in EXCLUDED_TERMS:
                continue
            results.append({
                "type": ent.label_,
                "value": ent.text,
                "confidence": 0.2,
                "source": "ner"
            })
    return results
