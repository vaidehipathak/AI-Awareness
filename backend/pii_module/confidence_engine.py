def compute_confidence(source, bonus):
    base = 0.6 if source == "regex" else 0.8
    return min(base + bonus, 1.0)
