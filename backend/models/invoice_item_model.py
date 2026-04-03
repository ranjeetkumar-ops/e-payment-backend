from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from backend.database import Base


class InvoiceItem(Base):

    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(Integer, ForeignKey("invoices.id"))

    description = Column(String(250))
    qty = Column(Integer)
    price = Column(DECIMAL(12,2))
    total = Column(DECIMAL(14,2))