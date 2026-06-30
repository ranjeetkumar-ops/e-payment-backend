from fastapi import APIRouter, Depends,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user_model import User
from backend.utils.hash import verify_password
from backend.utils.jwt import create_token
from backend.models.role_model import Role
from backend.models.warehouse_model import Warehouse
router = APIRouter(prefix="/auth", tags=["Auth"])


def password_matches(plain_password: str, stored_password: str) -> bool:
    if plain_password == stored_password:
        return True

    try:
        return verify_password(plain_password, stored_password)
    except Exception:
        return False


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid Username")

    if not password_matches(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid Password")
    
      # ⭐ FETCH ROLE (IMPORTANT FIX)
    role = db.query(Role).filter(Role.id == user.role_id).first()
    # warehouse =db.query(Warehouse).filter(Warehouse_id == user.warehouse_id).first()
    warehouse = db.query(Warehouse).filter(Warehouse.id == user.warehouse_id).first()

    token = create_token({
        "sub": str(user.id),
        "role_id": user.role_id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "name": user.name,
        "user_id": user.id,
        "role": role.role_name if role else None ,  # ⭐ SAFE RETURN
        "warehouse": warehouse.warehouse_id if warehouse else None,
        "warehouse_name": warehouse.warehouse_name if warehouse else None,
        "warehouse_id": warehouse.id if warehouse else None
         
        
    }
