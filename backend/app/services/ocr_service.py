from fastapi import UploadFile
from io import BytesIO

async def extract_text_from_upload(file: UploadFile) -> str:
    data = await file.read()
    try:
        if (file.content_type and "pdf" in file.content_type.lower()) or (file.filename and file.filename.lower().endswith(".pdf")):
            from pdfminer.high_level import extract_text
            return extract_text(BytesIO(data)) or ""
    except Exception:
        pass
    try:
        from PIL import Image
        import pytesseract
        img = Image.open(BytesIO(data))
        return pytesseract.image_to_string(img)
    except Exception:
        return ""
