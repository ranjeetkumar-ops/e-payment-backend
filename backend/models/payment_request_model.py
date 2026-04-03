from sqlalchemy import Column, DateTime, Integer, String, DECIMAL, TIMESTAMP, ForeignKey, TEXT
from backend.database import Base
from sqlalchemy.sql import func


# class PaymentRequest(Base):

#     __tablename__ = "payment_requests"

#     id = Column(Integer, primary_key=True, index=True)
#     request_code = Column(String(30), unique=True)

#     vendor_id = Column(Integer, ForeignKey("vendors.id"))
#     warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
#     created_by = Column(Integer)

#     status = Column(String(50), default="Draft")
#     current_level = Column(Integer, default=1)

#     grand_total = Column(DECIMAL(14,2))
#     reject_reason = Column(TEXT)

#     submitted_at = Column(TIMESTAMP)
#     approved_at = Column(TIMESTAMP)
#     paid_at = Column(TIMESTAMP)

#     created_at = Column(TIMESTAMP, server_default=func.now())


class PaymentRequest(Base):
    __tablename__ = "payment_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String(30))
    vendor_id = Column(Integer)
    warehouse_id = Column(String(50))  # keep as is for now

    created_by = Column(Integer)
    status = Column(String(50), default="Draft")
    current_level = Column(Integer, default=1)

    grand_total = Column(DECIMAL(14,2))
    reject_reason = Column(String)

    submitted_at = Column(DateTime)
    approved_at = Column(DateTime)

    paid_at = Column(DateTime)
    paid_by = Column(Integer)
    utr_number = Column(String(100))