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
    # We use a wrapper since cloudinary upload is synchronous by default,
    # but we can call it in an async function safely enough for a stub.
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        resource_type="auto",
        public_id=f"{folder}/{filename}"
    )
    return result["secure_url"]
