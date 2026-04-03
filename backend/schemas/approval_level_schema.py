from pydantic import BaseModel

class ApprovalLevelCreate(BaseModel):
    level_no: int
    role_id: int
    level_name: str


class ApprovalLevelOut(BaseModel):
    id: int
    level_no: int
    role_id: int
    level_name: str

    class Config:
        from_attributes = True