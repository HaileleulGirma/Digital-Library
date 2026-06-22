from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Document, User
from ..schemas import DocumentCreate, DocumentResponse
from ..dependencies import get_current_user, RoleChecker

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    doc_in: DocumentCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(RoleChecker(["admin", "editor"]))
):
    new_doc = Document(
        title=doc_in.title,
        uploaded_by=current_user.id, # <--- THE FIX: Save the Integer ID to the DB
        role_access=doc_in.role_access
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # Return the email to satisfy the React frontend
    return {
        "id": new_doc.id,
        "title": new_doc.title,
        "uploaded_by": current_user.email, 
        "role_access": new_doc.role_access,
        "uploaded_at": new_doc.uploaded_at
    }

@router.get("", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role_name = current_user.role_relationship.user_role
    
    docs = db.query(Document).filter(Document.role_access.contains([role_name])).all()
    
    # Extract the email via the SQLAlchemy relationship for the UI
    return [
        {
            "id": doc.id,
            "title": doc.title,
            "uploaded_by": doc.uploader.email if doc.uploader else "Unknown User",
            "role_access": doc.role_access,
            "uploaded_at": doc.uploaded_at
        } for doc in docs
    ]

@router.get("/{id}", response_model=DocumentResponse)
def get_document_by_id(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    role_name = current_user.role_relationship.user_role
    if role_name not in doc.role_access:
        raise HTTPException(status_code=403, detail="Resource access authorization failed")
        
    return {
        "id": doc.id,
        "title": doc.title,
        "uploaded_by": doc.uploader.email if doc.uploader else "Unknown User",
        "role_access": doc.role_access,
        "uploaded_at": doc.uploaded_at
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["admin"]))):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(doc)
    db.commit()
    return None