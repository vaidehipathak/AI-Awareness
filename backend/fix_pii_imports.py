import os
import re

# Directory containing the PII module
pii_dir = r"c:\Users\EGOIST\Desktop\AI-Awareness-main\AI-Awareness-main\backend\pii_module"

# Files to update (excluding __pycache__ and non-Python files)
files_to_update = [
    "presidio_engine.py",
    "regex_patterns.py", 
    "keyword_context.py",
    "confidence_engine.py",
    "aadhaar_validator.py",
    "router.py",
    "risk_engine.py",
    "masking.py",
    "entity_mapper.py",
    "ner_detector.py",
    "privacy_educator.py",
    "file_handler.py",
    "pdf_extractor.py",
    "image_extractor.py",
    "ocr_cleaner.py",
    "pii_detector.py"
]

# Mapping of old imports to new imports
import_mappings = {
    r"from presidio_engine import": "from pii_module.presidio_engine import",
    r"from regex_patterns import": "from pii_module.regex_patterns import",
    r"from keyword_context import": "from pii_module.keyword_context import",
    r"from confidence_engine import": "from pii_module.confidence_engine import",
    r"from aadhaar_validator import": "from pii_module.aadhaar_validator import",
    r"from router import": "from pii_module.router import",
    r"from risk_engine import": "from pii_module.risk_engine import",
    r"from masking import": "from pii_module.masking import",
    r"from entity_mapper import": "from pii_module.entity_mapper import",
    r"from ner_detector import": "from pii_module.ner_detector import",
    r"from privacy_educator import": "from pii_module.privacy_educator import",
    r"from file_handler import": "from pii_module.file_handler import",
    r"from pdf_extractor import": "from pii_module.pdf_extractor import",
    r"from image_extractor import": "from pii_module.image_extractor import",
    r"from ocr_cleaner import": "from pii_module.ocr_cleaner import",
    r"from pii_detector import": "from pii_module.pii_detector import",
    r"from pii_engine import": "from pii_module.pii_engine import",
}

fixed_count = 0

for filename in files_to_update:
    filepath = os.path.join(pii_dir, filename)
    
    if not os.path.exists(filepath):
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all import replacements
        for old_import, new_import in import_mappings.items():
            content = re.sub(old_import, new_import, content)
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filename}")
            fixed_count += 1
        else:
            print(f"⏭️  Skipped: {filename} (no changes needed)")
            
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

print(f"\n✅ Fixed {fixed_count} files")
