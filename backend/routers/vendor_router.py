from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.vendor_model import Vendor
from backend.schemas.vendor_schema import VendorCreate

router = APIRouter(prefix="/vendor", tags=["Vendor"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create")
def create_vendor(data: VendorCreate, db: Session = Depends(get_db)):

    new_vendor = Vendor(**data.dict())

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return {
        "message": "Vendor Created",
        "vendor_id": new_vendor.vendor_id
    }


@router.get("/list")
def vendor_list(db: Session = Depends(get_db)):

    data = db.query(Vendor).all()

    result = []

    for v in data:
        result.append({
            "id": v.id,
            "vendor_id": v.vendor_id,
            "vendor_name": v.vendor_name,
            "city": v.city
        })

    return result