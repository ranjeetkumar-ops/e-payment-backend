from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.user_schema import UserCreate, UserUpdate
from backend.crud import user_crud
from backend.dependencies.auth_dependency import get_current_user
from backend.dependencies.role_dependency import admin_only

router = APIRouter(prefix="/users", tags=["Users"])


# 👑 ADMIN ONLY
@router.post("/")
def create(user: UserCreate,
           db: Session = Depends(get_db),
           current=Depends(admin_only)):
    return user_crud.create_user(db, user)


# 🔐 LOGIN REQUIRED
@router.get("/")
def all_users(db: Session = Depends(get_db),
              current=Depends(get_current_user)):
    return user_crud.get_users(db)


# 👑 ADMIN ONLY (Better Practice)
@router.put("/{user_id}")
def update(user_id: int,
           data: UserUpdate,
           db: Session = Depends(get_db),
           current=Depends(admin_only)):
    return user_crud.update_user(db, user_id, data)


# 👑 ADMIN ONLY (Very Important)
@router.delete("/{user_id}")
def delete(user_id: int,
           db: Session = Depends(get_db),
           current=Depends(admin_only)):
    return user_crud.delete_user(db, user_id)