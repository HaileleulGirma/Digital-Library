from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class UserRole(Base):
    __tablename__ = "user_role"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_role = Column(String(50), nullable=False, unique=True)
    users = relationship("User", back_populates="role_relationship")

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("user_role.id"), nullable=False)
    role_relationship = relationship("UserRole", back_populates="users")

class Document(Base):
    __tablename__ = "document"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    # Update this column to be a ForeignKey
    uploaded_by = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    role_access = Column(JSONB, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # This relationship is the magic that lets us easily access doc.uploader.email later
    uploader = relationship("User")