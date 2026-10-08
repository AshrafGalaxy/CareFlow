import io
import re
import requests
from PIL import Image
import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_file(file_bytes: bytes, filename: str, folder: str = "careflow/reports") -> str:
    """Upload to Cloudinary. Returns the secure_url."""
    # Strip extension from public_id to avoid double extensions like .pdf.pdf
    base_name = filename.rsplit('.', 1)[0]
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        resource_type="auto",
        public_id=base_name
    )
    return result["secure_url"]

async def delete_file(file_url: str):
    """Delete a file from Cloudinary using its URL."""
    try:
        folder = "careflow/reports"
        idx = file_url.find(folder)
        if idx != -1:
            public_id = file_url[idx:]
            public_id_no_ext = public_id.rsplit('.', 1)[0]
            cloudinary.uploader.destroy(public_id, resource_type="raw")
            cloudinary.uploader.destroy(public_id_no_ext, resource_type="image")
    except Exception as e:
        print(f"Failed to delete file from cloud: {e}")

def get_pdf_bytes_from_cloudinary(cloudinary_url: str) -> bytes:
    """
    Given a Cloudinary asset URL for a PDF, fetches the high-definition
    rendered pages (which Cloudinary delivers with 200 OK without raw PDF ACL restrictions)
    and stitches them into a standard, clean PDF byte stream.
    """
    # Try direct fetch first in case the Cloudinary account has unrestricted raw PDF delivery
    try:
        clean_direct_url = cloudinary_url.replace(".pdf.pdf", ".pdf")
        direct_resp = requests.get(clean_direct_url, timeout=5)
        if direct_resp.status_code == 200 and len(direct_resp.content) > 100 and direct_resp.content.startswith(b"%PDF"):
            return direct_resp.content
    except Exception:
        pass

    # Standard Cloudinary multi-page delivery: convert pages into high-res images
    for pattern in ['.pdf.png', '.png', '.pdf.jpg', '.jpg']:
        test_base = re.sub(r'\.pdf(\.pdf)?$', pattern, cloudinary_url)
        test_page1 = test_base.replace('/upload/', '/upload/pg_1/')
        resp = requests.get(test_page1, timeout=8)
        if resp.status_code == 200 and len(resp.content) > 0:
            pages = [Image.open(io.BytesIO(resp.content)).convert('RGB')]
            for p in range(2, 40):
                next_url = test_base.replace('/upload/', f'/upload/pg_{p}/')
                r = requests.get(next_url, timeout=8)
                if r.status_code == 200 and len(r.content) > 0:
                    pages.append(Image.open(io.BytesIO(r.content)).convert('RGB'))
                else:
                    break
            out = io.BytesIO()
            pages[0].save(out, format='PDF', save_all=True, append_images=pages[1:])
            return out.getvalue()

    raise ValueError(f"Could not retrieve PDF pages from Cloudinary URL: {cloudinary_url}")
