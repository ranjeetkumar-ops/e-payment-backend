from pydantic import BaseModel

class WarehouseCreate(BaseModel):
    warehouse_name: str
    address_line1: str
    address_line2: str | None = None
    city: str
    state: str
    pincode: str
    country: str | None = None
    contact_person: str | None = None
    contact_phone: str | None = None
    email: str | None = None