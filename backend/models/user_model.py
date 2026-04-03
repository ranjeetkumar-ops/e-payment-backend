# from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
# from sqlalchemy.orm import relationship
# from backend.database import Base
# from backend.models.role_model import Role
# role = relationship(Role)


# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)

#     username = Column(String(100), unique=True, nullable=False)
#     email = Column(String(150), unique=True, nullable=False)
#     password = Column(String(255), nullable=False)

#     role_id = Column(Integer, ForeignKey("roles.id"))

#     is_active = Column(Boolean, default=True)

#     role = relationship("Role", back_populates="users")

   
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), unique=True, nullable=False)
    
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    role_id = Column(Integer, ForeignKey("roles.id"))
    warehouse_id = Column(Integer,ForeignKey("warehouses.id"))
   
    is_active = Column(Boolean, default=True)

    role = relationship("Role", back_populates="users")