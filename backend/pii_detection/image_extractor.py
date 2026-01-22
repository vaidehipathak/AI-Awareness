import cv2
import pytesseract
from ocr_cleaner import clean_ocr_text

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        return ""

    # 1️⃣ Convert to grayscale (NO thresholding)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 2️⃣ Mild noise reduction (very important)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # 3️⃣ OCR with safe config
    raw_text = pytesseract.image_to_string(
        gray,
        lang="eng+hin",
        config="--psm 6"
    )

    # 4️⃣ Clean OCR output
    cleaned_text = clean_ocr_text(raw_text)

    return cleaned_text
