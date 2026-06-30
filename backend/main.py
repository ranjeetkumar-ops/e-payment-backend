from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base, SessionLocal
from sqlalchemy import text
import os

# ⭐ Import Models Properly
from backend.models.user_model import User
from backend.models.role_model import Role
from backend.models.warehouse_model import Warehouse

# ⭐ Import Routers
from backend.routers import warehouse_router
from backend.routers import vendor_router
from backend.routers import payment_request_router
from backend.routers import invoice_router
from backend.routers import role_router
from backend.routers import user_router
from backend.routers import auth_router
from backend.routers import approval_level_router
from fastapi.staticfiles import StaticFiles
from backend.routers import attachment_router

if not os.path.exists("uploads"):
    os.makedirs("uploads")


def create_support_tables():
    id_column = (
        "id INTEGER PRIMARY KEY AUTOINCREMENT"
        if engine.dialect.name == "sqlite"
        else "id INTEGER PRIMARY KEY AUTO_INCREMENT"
    )

    with engine.begin() as connection:
        connection.execute(text(f"""
            CREATE TABLE IF NOT EXISTS user_warehouses (
                {id_column},
                user_id INTEGER NOT NULL,
                warehouse_id INTEGER NOT NULL,
                UNIQUE (user_id, warehouse_id)
            )
        """))


def seed_first_admin():
    db = SessionLocal()
    try:
        role = db.query(Role).filter(Role.id == 1).first()
        if not role:
            role = Role(id=1, role_name="Admin", level_no=1)
            db.add(role)

        warehouse = db.query(Warehouse).filter(Warehouse.id == 1).first()
        if not warehouse:
            warehouse = Warehouse(
                id=1,
                warehouse_id=os.getenv("SEED_WAREHOUSE_CODE", "MAIN"),
                warehouse_name=os.getenv("SEED_WAREHOUSE_NAME", "Main Warehouse"),
                city="",
                state="",
                country="",
            )
            db.add(warehouse)

        db.flush()

        seed_username = os.getenv("SEED_ADMIN_USERNAME", "Test1")
        admin_user = db.query(User).filter(User.username == seed_username).first()

        if not admin_user:
            admin_user = User(username=seed_username)
            db.add(admin_user)

        admin_user.name = os.getenv("SEED_ADMIN_NAME", "Test User")
        admin_user.email = os.getenv("SEED_ADMIN_EMAIL", "test1@example.com")
        admin_user.password = os.getenv("SEED_ADMIN_PASSWORD", "Test@321")
        admin_user.role_id = role.id
        admin_user.warehouse_id = warehouse.id
        admin_user.is_active = True

        db.flush()

        existing_assignment = db.execute(
            text("""
                SELECT 1
                FROM user_warehouses
                WHERE user_id = :user_id AND warehouse_id = :warehouse_id
            """),
            {"user_id": admin_user.id, "warehouse_id": warehouse.id},
        ).fetchone()

        if not existing_assignment:
            db.execute(
                text("""
                    INSERT INTO user_warehouses (user_id, warehouse_id)
                    VALUES (:user_id, :warehouse_id)
                """),
                {"user_id": admin_user.id, "warehouse_id": warehouse.id},
            )

        db.commit()
    finally:
        db.close()




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(warehouse_router.router)
app.include_router(vendor_router.router)
app.include_router(payment_request_router.router)
app.include_router(invoice_router.router)
app.include_router(role_router.router)
app.include_router(approval_level_router.router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(attachment_router.router)
# app.include_router(approval_matrix_router.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    create_support_tables()
    seed_first_admin()

@app.get("/")
def home():
    return {"message": "E Payment Backend Running"}


  
