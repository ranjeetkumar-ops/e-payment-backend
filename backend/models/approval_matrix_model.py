from sqlalchemy import Column, Integer, ForeignKey
from backend.database import Base

class ApprovalMatrix(Base):
    __tablename__ = "approval_matrix"

    id = Column(Integer, primary_key=True)
    level_id = Column(Integer, ForeignKey("approval_levels.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))