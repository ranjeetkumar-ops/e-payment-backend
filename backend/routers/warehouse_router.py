from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.warehouse_model import Warehouse
from backend.schemas.warehouse_schema import WarehouseCreate

router = APIRouter(prefix="/warehouse", tags=["Warehouse"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from backend.dependencies.auth_dependency import get_current_user
from sqlalchemy import text


# ⭐ GET USER ASSIGNED WAREHOUSES

@router.get("/my-warehouses")
def my_warehouses(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    data = db.execute(text("""
        SELECT 
            w.id,
            w.warehouse_name,
            CASE 
                WHEN w.id = u.warehouse_id THEN 1
                ELSE 0
            END AS is_default

        FROM user_warehouses uw
        JOIN warehouses w ON uw.warehouse_id = w.id
        JOIN users u ON u.id = uw.user_id

        WHERE uw.user_id = :uid
    """), {"uid": user.id}).fetchall()

    result = []

    for w in data:
        result.append({
            "id": w.id,
            "warehouse_name": w.warehouse_name,
            "is_default": w.is_default
        })

    return result


# ⭐ CREATE WAREHOUSE
@router.post("/create")
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db)):

    new_wh = Warehouse(
        warehouse_name=data.warehouse_name,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        country=data.country,
        contact_person=data.contact_person,
        contact_phone=data.contact_phone,
        email=data.email
    )

    db.add(new_wh)
    db.commit()
    db.refresh(new_wh)

    return {
        "message": "Warehouse Created",
        "warehouse_id": new_wh.warehouse_id
    }


# ⭐ GET WAREHOUSE LIST
@router.get("/list")
def warehouse_list(db: Session = Depends(get_db)):

    data = db.query(Warehouse).all()

    result = []

    for w in data:
        result.append({
            "id": w.id,
            "warehouse_id": w.warehouse_id,
            "warehouse_name": w.warehouse_name,
            "address_line1" : w.address_line1,
            "address_line2": w.address_line2,
            "city": w.city,
            "state": w.state,
            "pincode":w.pincode,
            "country": w.country,
            "contact_person":w.contact_person,
            "contact_phone":w.contact_phone,
            "email":w.email,
        })

    return result