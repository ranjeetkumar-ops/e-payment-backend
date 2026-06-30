
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
import os


LOCAL_DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/e_payment_system"
DATABASE_URL = os.getenv("DATABASE_URL", LOCAL_DATABASE_URL)

if os.getenv("RENDER"):
    if DATABASE_URL == LOCAL_DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured on Render. Set it to your public "
            "MySQL connection string, not localhost."
        )

    database_host = make_url(DATABASE_URL).host
    if database_host in {"localhost", "127.0.0.1"}:
        raise RuntimeError(
            "DATABASE_URL points to localhost. On Render, use the external "
            "hostname for your MySQL database."
        )

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
 autocommit=False,
 autoflush=False,
 bind=engine
 )

Base = declarative_base()

#THIS FUNCTION IS REQUIRED
def get_db():
     db = SessionLocal()
     try:
         yield db
     finally:
         db.close()

