from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    role_id: int


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role_id: int | None = None
    is_active: bool | None = None


class UserOut(BaseModel):
    id: int
    username: Optional[str]
    name: Optional[str]
    email: Optional[str]
    role_id: Optional[int]
    is_active: Optional[bool]

    class Config:
        from_attributes = True