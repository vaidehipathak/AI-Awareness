try:
    import presidio_analyzer
    print("presidio-analyzer: INSTALLED")
except ImportError:
    print("presidio-analyzer: MISSING")

try:
    import spacy
    print("spacy: INSTALLED")
except ImportError:
    print("spacy: MISSING")

try:
    import phonenumbers
    print("phonenumbers: INSTALLED")
except ImportError:
    print("phonenumbers: MISSING")
