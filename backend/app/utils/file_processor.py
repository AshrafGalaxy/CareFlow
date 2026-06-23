from fastapi import HTTPException, status

ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
MAX_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file_type: str, file_size: int):
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, JPG, and PNG are allowed."
        )
    if file_size > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large. Maximum allowed size is 10MB."
        )
