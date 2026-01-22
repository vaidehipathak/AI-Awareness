from presidio_analyzer import AnalyzerEngine

# Allow ONLY high-precision entities
ALLOWED_ENTITIES = {
    "EMAIL_ADDRESS": "EMAIL",
    "PHONE_NUMBER": "PHONE",
    "URL": "URL" 
}

analyzer = AnalyzerEngine()

def detect_pii_presidio(text):
    results = analyzer.analyze(
        text=text,
        language="en",
        entities=list(ALLOWED_ENTITIES.keys()),
        score_threshold=0.75
    )

    detections = []
    for r in results:
        detections.append({
            "type": ALLOWED_ENTITIES[r.entity_type],
            "value": text[r.start:r.end],
            "confidence": round(r.score, 2),
            "start": r.start,
            "end": r.end,
            "source": "presidio"
        })

    return detections
