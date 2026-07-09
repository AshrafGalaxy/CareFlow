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

async def delete_file(file_url: str):
    """Delete a file from Cloudinary using its URL."""
    try:
        folder = "careflow/reports"
        idx = file_url.find(folder)
        if idx != -1:
            public_id = file_url[idx:]
            public_id_no_ext = public_id.rsplit('.', 1)[0]
            
            # Destroy using raw and image resource types to ensure it's deleted regardless of how Cloudinary categorized it
            cloudinary.uploader.destroy(public_id, resource_type="raw")
            cloudinary.uploader.destroy(public_id_no_ext, resource_type="image")
    except Exception as e:
        print(f"Failed to delete file from cloud: {e}")

