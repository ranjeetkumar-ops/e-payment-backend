from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.invoice_model import Invoice
from backend.models.invoice_item_model import InvoiceItem
from backend.models.attachment_model import Attachment
from backend.schemas.invoice_schema import InvoiceCreate
from sqlalchemy import func
from backend.models.payment_request_model import PaymentRequest
from fastapi import HTTPException

router = APIRouter(prefix="/invoice", tags=["Invoice"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 

@router.post("/add")
def add_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
     # ⭐ CHECK PAYMENT REQUEST STATUS 
    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == data.payment_request_id
    ).first()

    if not req:
        raise HTTPException(404, "Payment Request Not Found")

    if req.status != "Draft":
        raise HTTPException(400, "Cannot add invoice. PR already submitted.")

    # ⭐ NOW INSERT INVOICE 
    # ⭐ Insert Invoice
    inv = Invoice(
        payment_request_id=data.payment_request_id,
        invoice_no=data.invoice_no,
        invoice_date=data.invoice_date,
        gst_percent=data.gst_percent,
        subtotal=data.subtotal,
        gst_amount=data.gst_amount,
        total_amount=data.total_amount)
    db.add(inv)
    db.commit()
    db.refresh(inv)

    # ⭐ Insert Items
    for item in data.items:
        line_total = item.qty * item.price   # ⭐ calculate here
        row = InvoiceItem(
          invoice_id = inv.id,
          description = item.description,
          qty = item.qty,
          price = item.price,
         total = line_total
         )
    
        db.add(row)

    # ⭐ Insert Attachment
    if data.attachment_path:
        att = Attachment(
            invoice_id=inv.id,
            file_path=data.attachment_path
        )
        db.add(att)

    # db.commit()

    # return {"message": "Invoice Added Successfully"}
    
    #⭐ Update Payment Request Grand Total
    total =db.query(func.sum(Invoice.total_amount)).filter(Invoice.payment_request_id == data.payment_request_id).scalar()
    req = db.query(PaymentRequest).filter(PaymentRequest.id == data.payment_request_id).first()

    req.grand_total =total
    
    db.commit()

    return { "id": inv.id, "message": "Invoice Added Successfully"}




@router.get("/by-request/{request_id}")
def get_invoices(request_id: int, db: Session = Depends(get_db)):

    invoices = db.query(Invoice).filter(
        Invoice.payment_request_id == request_id
    ).all()

    result = []

    for inv in invoices:

        items = db.query(InvoiceItem).filter(
            InvoiceItem.invoice_id == inv.id
        ).all()

        attachment = db.query(Attachment).filter(
            Attachment.invoice_id == inv.id
        ).first()

        result.append({
            "invoice_id": inv.id,
            "invoice_no": inv.invoice_no,
            "invoice_date": inv.invoice_date,
            "total_amount": float(inv.total_amount),
            "items": [
                {
                    "description": i.description,
                    "qty": i.qty,
                    "price": float(i.price),
                    "total": float(i.total)
                } for i in items
            ],
            "attachment": attachment.file_path if attachment else None
        })

    return result