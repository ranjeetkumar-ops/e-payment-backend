from pydantic import BaseModel
from typing import List


class ItemSchema(BaseModel):
    description: str
    qty: int
    price: float
    # total: float


class InvoiceCreate(BaseModel):
    payment_request_id: int
    invoice_no: str
    invoice_date: str
    gst_percent: float
    subtotal: float
    gst_amount: float
    total_amount: float
    items: List[ItemSchema]
    attachment_path: str | None = None