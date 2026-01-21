import re

def clean_ocr_text(text):
    clean_lines = []

    for line in text.splitlines():
        line = line.strip()

        # Skip empty lines
        if not line:
            continue

        # Skip lines with mostly symbols or random casing
        if len(re.findall(r"[A-Za-z0-9]", line)) < 4:
            continue

        # Skip lines with strange mixed casing (OCR noise)
        if sum(c.isupper() for c in line) > 0 and sum(c.islower() for c in line) > 0:
            if len(line) < 15:
                continue

        # Skip obvious garbage patterns
        if re.search(r"(feat|tt aNd|@@@|###)", line, re.IGNORECASE):
            continue

        clean_lines.append(line)

    return "\n".join(clean_lines)
