from pydantic import BaseModel

class VendorCreate(BaseModel):

    vendor_name: str

    gst_number: str | None = None
    pan_number: str | None = None

    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = None

    contact_person: str | None = None
    contact_phone: str | None = None
    email: str | None = None

    bank_name: str | None = None
    account_number: str | None = None
    ifsc_code: str | None = None