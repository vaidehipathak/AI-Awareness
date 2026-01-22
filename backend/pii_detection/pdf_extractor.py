import pdfplumber
from pdf2image import convert_from_path
import pytesseract
import os

# Explicit paths (Windows-safe)
# Ensure Tesseract is installed at this location
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Ensure Poppler is extracted to C:\poppler
# Common structure: C:\poppler\Library\bin OR C:\poppler\bin
POPPLER_PATH = r"C:\poppler\Library\bin" 
if not os.path.exists(POPPLER_PATH):
    POPPLER_PATH = r"C:\poppler\bin" # Fallback for different versions

def extract_text_from_pdf(file_path):
    import logging
    logger = logging.getLogger(__name__)
    
    text = ""
    total_pages = 0

    # 1️⃣ Try normal text-based extraction from ALL pages
    try:
        with pdfplumber.open(file_path) as pdf:
            total_pages = len(pdf.pages)
            logger.info(f"📄 PDF has {total_pages} pages, extracting text from ALL pages...")
            
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text += page_text + "\n"
                        logger.debug(f"Page {page_num}: Extracted {len(page_text)} characters")
                except Exception as page_error:
                    logger.warning(f"Failed to extract text from page {page_num}: {page_error}")
                    continue
    except Exception as e:
        logger.error(f"pdfplumber extraction failed: {e}")
        text = ""

    extracted_text = text.strip()
    logger.info(f"📊 Total extracted text: {len(extracted_text)} characters from {total_pages} pages")

    # 2️⃣ Check if we need OCR - Aadhaar cards should have 500+ characters
    # If we got very little text, it's likely a scanned/image-based PDF
    needs_ocr = len(extracted_text) < 500
    
    if needs_ocr:
        logger.warning(f"⚠️ VERY LITTLE TEXT ({len(extracted_text)} chars). PDF is likely scanned. Triggering OCR...")
    elif not extracted_text:
        logger.warning("⚠️ NO TEXT EXTRACTED. Triggering OCR...")
        needs_ocr = True

    # 3️⃣ OCR scanned PDF if needed (explicit Poppler path)
    if needs_ocr:
        if os.path.exists(POPPLER_PATH) and os.path.exists(pytesseract.pytesseract.tesseract_cmd):
            try:
                logger.info(f"🖼️ Converting PDF to images using Poppler at {POPPLER_PATH}...")
                images = convert_from_path(
                    file_path,
                    poppler_path=POPPLER_PATH,
                    dpi=300  # Higher DPI for better OCR quality
                )
                logger.info(f"✅ Converted PDF to {len(images)} images for OCR")
                
                ocr_text = ""
                for i, img in enumerate(images, 1):
                    try:
                        logger.info(f"🔍 Running OCR on page {i}/{len(images)}...")
                        page_ocr = pytesseract.image_to_string(img, lang="eng+hin", config="--psm 6")
                        if page_ocr and page_ocr.strip():
                            ocr_text += page_ocr + "\n"
                            logger.info(f"✅ Page {i} OCR: Extracted {len(page_ocr)} characters")
                    except Exception as page_ocr_error:
                        logger.warning(f"❌ OCR failed for page {i}: {page_ocr_error}")
                
                if ocr_text.strip():
                    combined_text = (extracted_text + "\n" + ocr_text).strip()
                    logger.info(f"🎉 OCR extracted {len(ocr_text)} characters. Combined total: {len(combined_text)}")
                    return combined_text
                else:
                    logger.warning("⚠️ OCR completed but extracted no text")
            except Exception as e:
                logger.error(f"❌ OCR Failed: {e}", exc_info=True)
        else:
            missing = []
            if not os.path.exists(POPPLER_PATH):
                missing.append(f"Poppler (expected at {POPPLER_PATH})")
            if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
                missing.append(f"Tesseract (expected at {pytesseract.pytesseract.tesseract_cmd})")
            logger.error(f"❌ OCR dependencies missing: {', '.join(missing)}. Skipping OCR.")

    # Return whatever text we extracted (even if short, if OCR failed)
    logger.info(f"📤 Returning {len(extracted_text)} characters")
    return extracted_text
