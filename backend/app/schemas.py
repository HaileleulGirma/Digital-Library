from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role_name: str # 'admin', 'editor', or 'viewer'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class DocumentCreate(BaseModel):
    title: str
    role_access: List[str]

class DocumentResponse(BaseModel):
    id: int
    title: str
    uploaded_by: str
    role_access: List[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True