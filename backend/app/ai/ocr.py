import pdfplumber
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes
import io
import shutil

# Bulletproof tesseract path for Windows background tasks
tesseract_path = shutil.which("tesseract")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path


async def extract_text_from_file(file_bytes: bytes, file_type: str) -> str:
    """
    Extract raw text from PDF or image file.
    Returns clean text string.
    """
    if file_type == "text/plain":
        # Re-analyze path: file_bytes IS the already-extracted OCR text
        return file_bytes.decode("utf-8", errors="replace")
    elif file_type == "application/pdf":
        return await _extract_from_pdf(file_bytes)
    elif file_type in ["image/jpeg", "image/jpg", "image/png"]:
        return await _extract_from_image(file_bytes)
    raise ValueError(f"Unsupported file type: {file_type}")


async def _extract_from_pdf(file_bytes: bytes) -> str:
    text = ""
    # Try pdfplumber first (works for digital PDFs)
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # If empty (scanned PDF), use Tesseract OCR via page images
    if not text.strip():
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                pix = page.get_pixmap(dpi=200)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                img = img.convert('L') # grayscale
                text += pytesseract.image_to_string(img, lang='eng') + "\n"
        except ImportError:
            # Fallback if PyMuPDF somehow fails to import
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, dpi=200)
            for image in images:
                image = image.convert('L')
                text += pytesseract.image_to_string(image, lang='eng') + "\n"

    return _clean_ocr_text(text)


async def _extract_from_image(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    # Preprocess: convert to grayscale for better OCR
    image = image.convert('L')
    text = pytesseract.image_to_string(image, lang='eng')
    return _clean_ocr_text(text)


def _clean_ocr_text(text: str) -> str:
    """Remove excessive whitespace, fix common OCR artifacts."""
    lines = [line.strip() for line in text.split('\n')]
    lines = [line for line in lines if line]  # remove empty lines
    return '\n'.join(lines)
