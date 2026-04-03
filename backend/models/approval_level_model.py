#Create Approval Level Table

from sqlalchemy import Column, Integer, String ,ForeignKey
from backend.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class ApprovalLevel(Base):
    __tablename__ = "approval_levels"

    id = Column(Integer, primary_key=True, index=True)
    level_no = Column(Integer)  
    role_id = Column(Integer, ForeignKey("roles.id"))     # 1 ,2 ,3 ,4
    level_name = Column(String)     # Manager / Finance / Director