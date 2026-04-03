from pydantic import BaseModel

class PaymentRequestCreate(BaseModel):

    vendor_id: int
    warehouse_id: int
    created_by: int
    grand_total: float