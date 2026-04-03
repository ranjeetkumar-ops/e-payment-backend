from pydantic import BaseModel

class RoleCreate(BaseModel):
    role_name: str
    level_no: int