from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base

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






Base.metadata.create_all(bind=engine)

import os

if not os.path.exists("uploads"):
    os.makedirs("uploads")



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

@app.get("/")
def home():
    return {"message": "E Payment Backend Running"}


  