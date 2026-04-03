from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.role_model import Role
from backend.schemas.role_schema import RoleCreate
from backend.dependencies.auth_dependency import get_current_user
from backend.dependencies.role_dependency import admin_only
from typing import Optional, List
from backend.utils.jwt import create_token

router = APIRouter(prefix="/roles", tags=["Roles"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create")
def create_role(data: RoleCreate, db: Session = Depends(get_db)):

    role = Role(
        role_name=data.role_name,
        level_no=data.level_no
    )

    db.add(role)
    db.commit()

    return {"message": "Role Created"}


#     @router.get("/",response_model=List[UserOut])
# def all_users(db: Session = Depends(get_db),
#               current=Depends(admin_only)):
#     return user_crud.get_users(db)


@router.get("/list")
def role_list(db: Session = Depends(get_db),current = Depends(admin_only)):
    roles = db.query(Role).order_by(Role.level_no).all()
    result = []
    for r in roles:
        result.append({
            "id": r.id,
            "role_name": r.role_name,
            "level_no": r.level_no
        })

    return result