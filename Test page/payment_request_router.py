from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal 
from backend.database import get_db
from backend.models.payment_request_model import PaymentRequest
from backend.schemas.payment_request_schema import PaymentRequestCreate
from backend.models.vendor_model import Vendor
from backend.models.warehouse_model import Warehouse
from datetime import datetime
from backend.models.payment_request_model import PaymentRequest
from backend.dependencies.auth_dependency import get_current_user
from fastapi import HTTPException
from sqlalchemy import text 
from backend.models.invoice_model import Invoice
from backend.models.invoice_item_model import InvoiceItem
from backend.models.attachment_model import Attachment

router = APIRouter(prefix="/payment-request", tags=["Payment Request"])


@router.get("/my-requests")
def my_requests(
        db: Session = Depends(get_db),
        user = Depends(get_current_user)):

        user_id = user.id

        data = db.query(
            PaymentRequest,
            Vendor.vendor_name,
            Vendor.vendor_id,
            Warehouse.warehouse_name,
            Warehouse.warehouse_id
            ).join(
                    Vendor, PaymentRequest.vendor_id == Vendor.id
            ).join(
                    Warehouse, PaymentRequest.warehouse_id == Warehouse.id
            ).outerjoin(
                    Invoice, Invoice.payment_request_id == PaymentRequest.id
            ).filter(
                    PaymentRequest.created_by == user_id
            ).all()
        result = []

        for pr, vendor_name, vendor_code, wh_name, wh_code in data:
                result.append({
                "id": pr.id,
                "request_code": pr.request_code,
                "vendor": vendor_name,
                "vendor_code": vendor_code,
                "warehouse": wh_name,
                "warehouse_code": wh_code,
                "grand_total": float(pr.grand_total),
                "status": pr.status,
                "Submitted at":pr.submitted_at,
                "invoice_count": db.query(Invoice).filter(Invoice.payment_request_id == pr.id).count()})

            # strftime("%d-%m-%Y %H:%M:%S") if pr.submitted_at else None
        return result



# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# ⭐ CREATE PAYMENT REQUEST
@router.post("/create")
def create_payment_request(data: PaymentRequestCreate, db: Session = Depends(get_db)):

    new_req = PaymentRequest(
        vendor_id=data.vendor_id,
        warehouse_id=data.warehouse_id,
        created_by=data.created_by,
        grand_total=data.grand_total,
        status="Draft",
        current_level=0
    )

    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    return {
        "message": "Payment Request Created",
        "id": new_req.id
    }


# ⭐ LIST PAYMENT REQUESTS (JOIN MASTER DATA)
@router.get("/list")
def list_payment_requests(db: Session = Depends(get_db)):

    data = db.query(
        PaymentRequest,
        Vendor.vendor_name,
        Vendor.vendor_id,
        Warehouse.warehouse_name,
        Warehouse.warehouse_id
    ).join(
        Vendor, PaymentRequest.vendor_id == Vendor.id
    ).join(
        Warehouse, PaymentRequest.warehouse_id == Warehouse.id
    ).join(
        Invoice, Invoice.payment_request_id == PaymentRequest.id, isouter=True
    ).all()

    result = []

    for pr, vendor_name, vendor_code, wh_name, wh_code in data:
        result.append({
            "id": pr.id,
            "request_code": pr.request_code,
            "vendor": vendor_name,
            "vendor_code": vendor_code,
            "warehouse": wh_name,
            "warehouse_code": wh_code,
            "grand_total": float(pr.grand_total),
            "status": pr.status,
            "Submitted at":pr.submitted_at,
            "invoice_count": db.query(Invoice).filter(Invoice.payment_request_id == pr.id).count()



            # strftime("%d-%m-%Y %H:%M:%S") if pr.submitted_at else None
        })

    return result


# @router.post("/submit/{request_id}")
# def submit_request(request_id: int, db: Session = Depends(get_db)):

#     req = db.query(PaymentRequest).filter(
#         PaymentRequest.id == request_id
#     ).first()

#     if not req:
#         return {"error": "Request not found"}

#     if req.status == "Submitted":
#         return {"message": "Already Submitted"}

#     req.status = "Submitted"
#     req.submitted_at = datetime.now()

#     db.commit()

#     return {"message": "Payment Request Submitted"}



@router.post("/submit/{request_id}")
def submit_request(
        request_id: int,
        db: Session = Depends(get_db),
        user = Depends(get_current_user)):

    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(404, "Request not found")

    if req.status != "Draft":
        raise HTTPException(400, "Only Draft request can be submitted")

    # ⭐ Check Invoice Exists (IMPORTANT)
    # invoice_count = db.execute(
    #     f"select count(*) from invoices where payment_request_id={request_id}"
    # ).scalar()
    invoice_count = db.execute(
         text("select count(*) from invoices where payment_request_id = :id"),{"id": request_id}
     ).scalar()

    if invoice_count == 0:
        raise HTTPException(400, "Add at least one invoice before submit")

    req.status = "Pending"
    req.current_level = 1
    req.submitted_at = datetime.now()

    db.commit()

    return {"message": "Payment Request Submitted for Approval"}


@router.post("/approve/{request_id}")
def approve_request(
        request_id:int,
        db:Session = Depends(get_db),
        user = Depends(get_current_user)):

    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(404,"Request not found")

    MAX_LEVEL = 3   # later dynamic from ApprovalLevel table

    if req.current_level < MAX_LEVEL:
        req.current_level += 1
    else:
        req.status = "Approved"
        req.approved_at = datetime.now()

    db.commit()

    return {"message":"Approved"}


# Reject API
@router.post("/reject/{request_id}")
def reject_request(
        request_id:int,
        reason:str,
        db:Session = Depends(get_db)):

    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(404,"Request not found")

    req.status = "Rejected"
    req.reject_reason = reason

    db.commit()

    return {"message":"Rejected"}

@router.get("/pending-approval")
def pending_approval(
        db: Session = Depends(get_db),
        user = Depends(get_current_user)):

    data = db.query(PaymentRequest).filter(
        PaymentRequest.status == "Pending"
    ).all()

    return data

@router.get("/request-details/{id}")
def request_details(id: int, db: Session = Depends(get_db)):

    pr = db.query(PaymentRequest).filter(PaymentRequest.id == id).first()

    if not pr:
        raise HTTPException(404, "Request not found")

    invoices = db.query(Invoice).filter(
        Invoice.payment_request_id == id
    ).all()

    invoice_list = []

    for inv in invoices:

        # ✅ GET ITEMS
        items = db.query(InvoiceItem).filter(
            InvoiceItem.invoice_id == inv.id
        ).all()

        # ✅ GET ATTACHMENT
        attachment = db.query(Attachment).filter(
            Attachment.invoice_id == inv.id
        ).first()

        invoice_list.append({
            "invoiceNo": inv.invoice_no,
            "invoiceDate": inv.invoice_date,
            "gst": inv.gst_percent,
            "items": [
                {
                    "description": i.description,
                    "qty": i.qty,
                    "price": float(i.price),
                    "total": float(i.total)
                } for i in items
            ],
            "file": attachment.file_path if attachment else None
        })

    return {
        "id": pr.id,
        "request_code": pr.request_code,
        "vendor": pr.vendor_id,
        "status": pr.status,
        "grandTotal": float(pr.grand_total),
        "invoiceList": invoice_list   # ✅ NOW CORRECT
    }

    pr = db.query(PaymentRequest).filter(PaymentRequest.id == id).first()

    if not pr:
        raise HTTPException(404, "Request not found")

    invoices = db.query(Invoice).filter(
        Invoice.payment_request_id == id
    ).all()

    invoice_list = []

    for inv in invoices:

        # Get Items 
        invoice_list.append({
            "invoiceNo": inv.invoice_no,
            "invoiceDate": inv.invoice_date,
            "gst": inv.gst_percent,
            "items": []   # you can expand later
        })

    return {
        "id": pr.id,
        "request_code": pr.request_code,
        "vendor": pr.vendor_id,
        "status": pr.status,
        "grandTotal": float(pr.grand_total),
        "invoiceList": invoice_list
    }