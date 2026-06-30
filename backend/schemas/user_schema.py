from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    role_id: int
    warehouse_id: Optional[int] = None


class UserUpdate(BaseModel):
    username: str | None = None
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role_id: int | None = None
    warehouse_id: int | None = None
    is_active: bool | None = None


class UserOut(BaseModel):
    id: int
    username: Optional[str]
    name: Optional[str]
    email: Optional[str]
    role_id: Optional[int]
    warehouse_id: Optional[int]
    is_active: Optional[bool]

    class Config:
        from_attributes = True


class UserWarehouseAssign(BaseModel):
    warehouse_ids: List[int]
