import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# DATABASE_URL = "postgresql://e_payment_system_user:jfZSfISYaNMndK5V6rKr1QIooZpiRlea@dpg-d77s3o94tr6s73d64lrg-a.ohio-postgres.render.com/e_payment_system"

# engine = create_engine(DATABASE_URL, echo=True)

# SessionLocal = sessionmaker(
# autocommit=False,
# autoflush=False,
# bind=engine
# )

# Base = declarative_base()

# # ⭐ THIS FUNCTION IS REQUIRED
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

load_dotenv()  # Load environment variables from .envfile      
DATABASE_URL = "postgresql://e_payment_system_user:jfZSfISYaNMndK5V6rKr1QIooZpiRlea@dpg-d77s3o94tr6s73d64lrg-a.ohio-postgres.render.com/e_payment_system"
# Fix for Render (important)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True  # ⭐ prevents connection timeout issues
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()