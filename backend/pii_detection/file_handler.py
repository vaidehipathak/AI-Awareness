import os
from pdf_extractor import extract_text_from_pdf
from image_extractor import extract_text_from_image

IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"]

def extract_text_from_file(file_path):
    file_path = file_path.strip().strip('"').strip("'")
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)

    if ext in IMAGE_EXTENSIONS:
        return extract_text_from_image(file_path)

    raise ValueError("Unsupported file type. Upload PDF or Image.")
