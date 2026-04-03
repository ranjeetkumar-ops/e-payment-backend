from fastapi import APIRouter, Depends,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user_model import User
from backend.utils.hash import verify_password
from backend.utils.jwt import create_token

router = APIRouter()
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):

    # user = db.query(User).filter(User.email == email).first()
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        return {"error": "Invalid Email"}

    if not verify_password(password, user.password):
        return {"error": "Invalid Password"}

    token = create_token({
        "user_id": user.id,
        "role_id": user.role_id
    })

    return {
        "token": token,
        "user_id": user.id,
        "role_id": user.role_id
    }