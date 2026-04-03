from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Role(Base):
    __tablename__ = "roles"     

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True)
    level_no = Column(Integer)

    created_at = Column(DateTime, server_default=func.now())

    # ⭐ One Role → Many Users
    users = relationship("User", back_populates="role")

# class User(Base):
#     __tablename__ = "users"
#     __table_args__ = {"extend_existing": True}

#     id = Column(Integer, primary_key=True, index=True)

#     name = Column(String(100))
#     email = Column(String(150), unique=True)
#     password = Column(String(255))

#     role_id = Column(Integer, ForeignKey("roles.id"))

#     # ⭐ Relationship
#     role = relationship("Role", back_populates="users")