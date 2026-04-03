from sqlalchemy import Column, Integer, String, TIMESTAMP
from backend.database import Base
from sqlalchemy.sql import func


class Warehouse(Base):

    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(String(20), unique=True)
    warehouse_name = Column(String(150))

    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(20))
    country = Column(String(100))
    contact_person = Column(String(150))
    contact_phone = Column(String(20))
    email  = Column(String(150))

    created_at = Column(TIMESTAMP, server_default=func.now())