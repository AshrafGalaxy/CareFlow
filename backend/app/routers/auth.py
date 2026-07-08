from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_password_hash, verify_password, create_access_token, create_refresh_token, verify_token
from app.middleware.auth_middleware import get_current_user
from app.models.provider_profile import ProviderProfile
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.middleware.auth_middleware import get_current_user
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        name=user_in.name,
        role=user_in.role,
        phone=user_in.phone,
        date_of_birth=user_in.date_of_birth,
        abha_id=user_in.abha_id,
        state_residence=user_in.state_residence,
        preferred_locale=user_in.preferred_locale,
        blood_group=user_in.blood_group,
        emergency_contact_name=user_in.emergency_contact_name,
        emergency_contact_phone=user_in.emergency_contact_phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if user_in.role == "doctor":
        provider_profile = ProviderProfile(
            user_id=new_user.id,
            nmc_registration_number=user_in.nmc_registration_number,
            medical_council=user_in.medical_council,
            qualification_degree=user_in.qualification_degree
        )
        db.add(provider_profile)
        db.commit()
        
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "created_at": user.created_at
        }
    }

@router.post("/refresh")
def refresh(request: RefreshRequest):
    payload = verify_token(request.refresh_token)
    user_id = payload.get("sub")
    role = payload.get("role")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    access_token = create_access_token(data={"sub": user_id, "role": role})
    return {"access_token": access_token}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/profile", response_model=UserResponse)
def update_profile(profile_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password_hash = get_password_hash(request.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully"}

@router.delete("/account")
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Hard delete: this cascades to all related tables because of ondelete="CASCADE" in models
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "Account deleted successfully"}

