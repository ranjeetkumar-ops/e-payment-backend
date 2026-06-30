
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
import os


LOCAL_DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/e_payment_system"
RENDER_DATABASE_URL = "sqlite:///./e_payment_render.db"

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = RENDER_DATABASE_URL if os.getenv("RENDER") else LOCAL_DATABASE_URL

if os.getenv("RENDER"):
    database_host = make_url(DATABASE_URL).host
    if database_host in {"localhost", "127.0.0.1"}:
        raise RuntimeError(
            "DATABASE_URL points to localhost. On Render, use the external "
            "hostname for your MySQL database."
        )

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)

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

