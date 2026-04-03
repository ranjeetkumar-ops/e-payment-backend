from fastapi import APIRouter
from sqlalchemy.orm import Session
from database import SessionLocal
from models.role import Role

router = APIRouter()

@router.get("/roles")
def get_roles():
    db: Session = SessionLocal()
    roles = db.query(Role).all()
    return roles

# Create Role API
@router.post("/roles")
def create_role(role_name: str):

    db: Session = SessionLocal()

    new_role = Role(role_name=role_name)

    db.add(new_role)
    db.commit()

    return {"message":"Role created"}

# Delete Role API
@router.delete("/roles/{role_id}")
def delete_role(role_id: int):

    db: Session = SessionLocal()

    role = db.query(Role).filter(Role.id == role_id).first()

    db.delete(role)
    db.commit()

    return {"message":"Role deleted"}