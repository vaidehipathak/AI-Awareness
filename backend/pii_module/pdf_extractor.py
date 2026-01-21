import pdfplumber
from pdf2image import convert_from_path
import pytesseract

# Explicit paths (Windows-safe)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\poppler\poppler-25.12.0\Library\bin"

def extract_text_from_pdf(file_path):
    text = ""

    # 1️⃣ Try normal text-based extraction
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # 2️⃣ If text exists, return it
    if text.strip():
        return text.strip()

    # 3️⃣ OCR scanned PDF (explicit Poppler path)
    images = convert_from_path(
        file_path,
        poppler_path=POPPLER_PATH
    )

    for img in images:
        text += pytesseract.image_to_string(img) + "\n"

    return text.strip()
