from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserRegister, UserLogin, TokenResponse
from ..auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Identity mapping already exists")
    
    role = db.query(UserRole).filter(UserRole.user_role == user_data.role_name.lower()).first()
    if not role:
        raise HTTPException(status_code=400, detail="Target system role does not exist")
        
    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, password=hashed_password, role_id=role.id)
    db.add(new_user)
    db.commit()
    return {"message": "Identity registered successfully"}

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    role_name = user.role_relationship.user_role
    access_token = create_access_token(data={"sub": user.email, "role": role_name})
    return {"access_token": access_token, "token_type": "bearer", "role": role_name}