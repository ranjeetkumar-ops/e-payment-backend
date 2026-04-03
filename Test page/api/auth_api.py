from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user_model import User
from backend.utils.security import verify_password
from backend.utils.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid Username")

    if not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_access_token(
        data={
            "user_id": user.id,
            "role_id": user.role_id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
        
    }