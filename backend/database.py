from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/e_payment_system"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
autocommit=False,
autoflush=False,
bind=engine
)

Base = declarative_base()

# ⭐ THIS FUNCTION IS REQUIRED
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()