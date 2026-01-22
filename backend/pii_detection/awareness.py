def awareness_message(risk):
    messages = {
        "HIGH": "⚠️ High privacy risk detected. Do not share sensitive personal information.",
        "MEDIUM": "⚠️ Moderate privacy risk. Be cautious while sharing personal details.",
        "LOW": "ℹ️ Low privacy risk. Limited personal information detected.",
        "NONE": "✅ No sensitive personal information detected."
    }
    return messages[risk]
