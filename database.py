import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Get DB URL from Render Environment Variables
DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL LOADED:", repr(DATABASE_URL))  # Debug for Render logs

# 1. Fix Render URL (postgres:// → postgresql://)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 2. Raise clear error if missing
if not DATABASE_URL:
    raise ValueError(
        "❌ DATABASE_URL is missing! Go to Render → Environment and add your Render PostgreSQL connection string."
    )

# 3. Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Utility for creating tables
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

# Provide DB session
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
