from sqlalchemy import Column, Integer, String, DECIMAL, DATE, ForeignKey, TIMESTAMP
from backend.database import Base
from sqlalchemy.sql import func


class Invoice(Base):

    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    payment_request_id = Column(Integer, ForeignKey("payment_requests.id"))

    invoice_no = Column(String(100))
    invoice_date = Column(DATE)

    gst_percent = Column(DECIMAL(5,2))

    subtotal = Column(DECIMAL(14,2))
    gst_amount = Column(DECIMAL(14,2))
    total_amount = Column(DECIMAL(14,2))

    created_at = Column(TIMESTAMP, server_default=func.now())