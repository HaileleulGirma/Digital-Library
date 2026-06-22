from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..dependencies import RoleChecker

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def get_all_users(
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["admin"])) # <--- Admin restriction
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role_relationship.user_role
        } for u in users
    ]