# backend/app/modules/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.dependencies import RoleChecker  # Optional: For protecting user creation
from app.modules.schemas import UserLogin, Token, UserCreate
from fastapi.security import OAuth2PasswordRequestForm  # <-- ADD THIS IMPORT

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
# Change payload from JSON to OAuth2PasswordRequestForm
@router.post("/login", response_model=Token)
def login(payload: OAuth2PasswordRequestForm = Depends()):
    # Swagger sends the email inside the 'username' field configuration
    user = db.get_user_by_email(payload.username)
    
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Check against either hashed database password or direct string value
    if user["password_hash"].startswith("$2b$") or user["password_hash"].startswith("$2a$"):
        if not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
    else:
        if payload.password != user["password_hash"]:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
            
    token = create_access_token(data={"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}

# Leave your register_user endpoint exactly as it is below...



@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate):
    """
    Registers a new system user profile. 
    (Note: You can protect this endpoint with Dependencies if only an admin/manager should create users)
    """
    # 1. Enforce that role satisfies business bounds[cite: 1]
    allowed_roles = {'Admin','Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'}
    if payload.role not in allowed_roles:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid role. Must be one of: {list(allowed_roles)}"
        )
        
    # 2. Check for pre-existing email keys
    existing_user = db.get_user_by_email(payload.email)
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="An account with this email is already registered."
        )
        
    # 3. Securely hash incoming plain text credentials
    hashed_password = get_password_hash(payload.password)
    
    # 4. Save into the repository
    user_record = {
        "email": payload.email,
        "password_hash": hashed_password,
        "role": payload.role
    }
    
    db.create_user(user_record)
    return {"message": "User registered successfully", "email": payload.email, "role": payload.role}