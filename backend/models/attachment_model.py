from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from backend.database import Base
from sqlalchemy.sql import func


class Attachment(Base):

    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(Integer, ForeignKey("invoices.id"))

    file_path = Column(String(300))

    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    