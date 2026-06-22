import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configured for standard PostgreSQL local port
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/fineto_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Yields a clean transactional session state per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()