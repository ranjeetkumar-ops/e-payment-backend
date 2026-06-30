from datetime import datetime
from fastapi import Request
from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text 
from backend.database import SessionLocal 
from backend.database import get_db
from backend.models.payment_request_model import PaymentRequest
from backend.models.vendor_model import Vendor
from backend.models.warehouse_model import Warehouse
from backend.models.payment_request_model import PaymentRequest
from backend.models.invoice_model import Invoice
from backend.models.invoice_item_model import InvoiceItem
from backend.models.attachment_model import Attachment
from backend.models.role_model import Role
from backend.models.approval_level_model import ApprovalLevel
from backend.models.user_model import User
from backend.schemas.payment_request_schema import PaymentRequestCreate
from backend.dependencies.auth_dependency import get_current_user

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
        Warehouse.warehouse_id,
        User.name
    ).join(
        Vendor, PaymentRequest.vendor_id == Vendor.id
    ).join(
        Warehouse, PaymentRequest.warehouse_id == Warehouse.id
    ).outerjoin(
        User, PaymentRequest.created_by == User.id
    ).filter(
        PaymentRequest.created_by == user_id
    ).all()

    result = []

    for pr, vendor_name, vendor_code, wh_name, wh_code, requester_name in data:
        
        # 🔥 Status logic
        status_text = pr.status
        if pr.status in ("Submitted", "Pending"):
            status_text = f"Pending at L{pr.current_level}"

        next_approval = None
        if pr.status in ("Submitted", "Pending") and pr.current_level:
            level = db.query(
                ApprovalLevel.level_no,
                ApprovalLevel.level_name,
                Role.role_name,
                ApprovalLevel.role_id
            ).join(
                Role, ApprovalLevel.role_id == Role.id
            ).filter(
                ApprovalLevel.level_no == pr.current_level
            ).first()

            if level:
                approvers = db.execute(text("""
                    SELECT DISTINCT u.name
                    FROM users u
                    JOIN user_warehouses uw ON uw.user_id = u.id
                    WHERE u.role_id = :role_id
                    AND uw.warehouse_id = :warehouse_id
                    AND u.is_active = 1
                    ORDER BY u.name
                """), {
                    "role_id": level.role_id,
                    "warehouse_id": pr.warehouse_id
                }).fetchall()

                next_approval = {
                    "level_no": level.level_no,
                    "level_name": level.level_name,
                    "role_name": level.role_name,
                    "approvers": [row.name for row in approvers]
                }

        rejected_by = None
        if pr.status == "Rejected":
            rejected = db.execute(text("""
                SELECT u.name, r.role_name, pa.level_no, al.level_name, pa.remarks
                FROM payment_approvals pa
                JOIN users u ON pa.approved_by = u.id
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN approval_levels al ON pa.level_no = al.level_no
                WHERE pa.payment_request_id = :request_id
                AND pa.status = 'Rejected'
                ORDER BY pa.action_at DESC, pa.id DESC
                LIMIT 1
            """), {
                "request_id": pr.id
            }).fetchone()

            if rejected:
                rejected_by = {
                    "name": rejected.name,
                    "role_name": rejected.role_name,
                    "level_no": rejected.level_no,
                    "level_name": rejected.level_name,
                    "reason": rejected.remarks
                }
            elif pr.reject_reason:
                rejected_by = {
                    "name": None,
                    "role_name": None,
                    "level_no": pr.current_level,
                    "level_name": None,
                    "reason": pr.reject_reason
                }

        # 🔥 Invoice count
        invoices = db.query(Invoice.invoice_no).filter(
            Invoice.payment_request_id == pr.id
        ).all()

        invoice_numbers = [inv[0] for inv in invoices]

        # 🔥 Total Amount
        total_amount = db.query(Invoice).filter(
            Invoice.payment_request_id == pr.id
        ).with_entities(func.sum(Invoice.total_amount)).scalar() or 0

        result.append({
            "id": pr.id,
            "request_code": pr.request_code,
            "vendor": vendor_name,
            "requester": requester_name,
            "status": status_text,
            "next_approval": next_approval,
            "rejected_by": rejected_by,
            "invoice_numbers": invoice_numbers,
            "amount": total_amount,
            "utr_number": pr.utr_number,
            "paid_at": pr.paid_at,
            "Submitted_at":pr.submitted_at
        })

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
        "id": new_req.id,
         "pr_id": new_req.request_code
    }


# ⭐ LIST PAYMENT REQUESTS (JOIN MASTER DATA)
# @router.get("/list")
# def list_payment_requests(db: Session = Depends(get_db)):
@router.get("/list")
def list_payment_requests(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    role_name = user.role.role_name if user.role else ""

    query = db.query(
        PaymentRequest,
        Vendor.vendor_name,
        Vendor.vendor_id,
        Warehouse.warehouse_name,
        Warehouse.warehouse_id,
        User.name
    ).join(
        Vendor, PaymentRequest.vendor_id == Vendor.id
    ).join(
        Warehouse, PaymentRequest.warehouse_id == Warehouse.id
    ).outerjoin(
        User, PaymentRequest.created_by == User.id
    )
    
    if role_name == "Accounts":
        query = query.filter(PaymentRequest.status == "pending_payment")
    elif role_name != "Admin":
        query = query.filter(PaymentRequest.created_by == user.id)

    data = query.all()

    result = []

    for pr, vendor_name, vendor_code, wh_name, wh_code, requester_name in data:
        
        invoices = db.query(Invoice.invoice_no).filter(
            Invoice.payment_request_id == pr.id
        ).all()

        invoice_numbers = [inv[0] for inv in invoices]
        amount = float(pr.grand_total or 0)

        result.append({
            "id": pr.id,
            "request_code": pr.request_code,
            "vendor": vendor_name,
            "requester": requester_name,
            "vendor_code": vendor_code,
            "invoice_numbers":invoice_numbers,
            "warehouse": wh_name,
            "warehouse_code": wh_code,
            "grand_total": amount,
            "amount": amount,
            "status": pr.status,
            "utr_number": pr.utr_number,
            "paid_at": pr.paid_at,
            "Submitted_at":pr.submitted_at,
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

# @router.put("/update/{request_id}")
# def update_payment(
#     request_id: int,
#     data: dict,
#     db: Session = Depends(get_db),
#     user = Depends(get_current_user)
# ):

#     req = db.query(PaymentRequest).filter(
#         PaymentRequest.id == request_id
#     ).first()

#     if not req:
#         raise HTTPException(404, "Request not found")

#     # ⭐ ONLY ACCOUNTS CAN PAY
#     if user.role != "accounts":
#         raise HTTPException(403, "Not allowed")

#     if "utr_number" in data:
#         req.utr_number = data["utr_number"]
#         req.status = "Paid"
#         req.paid_at = datetime.now()
#         req.paid_by = user.id

#     db.commit()

#     return {"message": "Payment Done"}

@router.put("/update/{request_id}")
def update_payment(
    request_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(404, "Request not found")

    # ✅ FIXED role
    if user.role.role_name != "Accounts":
        raise HTTPException(403, "Not allowed")

    if "utr_number" in data:
        req.utr_number = data["utr_number"]
        req.status = "Paid"
        req.paid_at = datetime.now()
        req.paid_by = user.id

    db.commit()

    return {
        "message": "Payment Done",
        "id": req.id
    }

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

    return {"message": "Payment Request Submitted for Approval",
            "pr_id": req.request_code
            }

@router.post("/approve/{request_id}")
def approve_request(
    request: Request,
    request_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    warehouse_id = request.headers.get("warehouse")

    if not warehouse_id:
        raise HTTPException(400, "Warehouse not selected")

    if str(warehouse_id).isdigit():
        warehouse_id = int(warehouse_id)
    else:
        warehouse_id = db.execute(text("""
            SELECT id FROM warehouses WHERE warehouse_id = :code
        """), {"code": warehouse_id}).scalar()

    if not warehouse_id:
        raise HTTPException(400, "Invalid warehouse")

    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == request_id,
        PaymentRequest.warehouse_id == warehouse_id   # ⭐ IMPORTANT
    ).first()

    if not req:
        raise HTTPException(404, "Request not found or wrong warehouse")

    if req.status != "Pending":
        raise HTTPException(400, "Not in approval stage")

    current_level = req.current_level

    # ✅ Role check
    level = db.execute(text("""
        SELECT role_id FROM approval_levels
        WHERE level_no = :lvl
    """), {"lvl": current_level}).fetchone()

    if not level:
        raise HTTPException(400, "Invalid level")

    if user.role_id != level.role_id:
        raise HTTPException(403, "Not allowed for this level")

    # ✅ Duplicate check
    already = db.execute(text("""
        SELECT 1 FROM payment_approvals
        WHERE payment_request_id = :rid AND level_no = :lvl
    """), {"rid": request_id, "lvl": current_level}).fetchone()

    if already:
        raise HTTPException(400, "Already approved")

    # ✅ Insert approval
    db.execute(text("""
        INSERT INTO payment_approvals
        (payment_request_id, level_no, approved_by, status, action_at)
        VALUES (:rid, :lvl, :uid, 'Approved', NOW())
    """), {
        "rid": request_id,
        "lvl": current_level,
        "uid": user.id
    })

    # ✅ Move level
    max_level = db.execute(text("SELECT MAX(level_no) FROM approval_levels")).scalar()

    if current_level < max_level:
        req.current_level += 1
    else:
        # ⭐ FINAL APPROVAL (Finance Head)
        req.status = "pending_payment"

    db.commit()

    return {"message": "Approved"}

# Reject API
@router.post("/reject/{request_id}")
def reject_request(
        request_id:int,
        reason:str,
        db:Session = Depends(get_db),
        user = Depends(get_current_user)):

    req = db.query(PaymentRequest).filter(
        PaymentRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(404,"Request not found")

    req.status = "Rejected"
    req.reject_reason = reason

    db.execute(text("""
        INSERT INTO payment_approvals
        (payment_request_id, level_no, approved_by, status, remarks, action_at)
        VALUES (:rid, :lvl, :uid, 'Rejected', :remarks, NOW())
    """), {
        "rid": request_id,
        "lvl": req.current_level,
        "uid": user.id,
        "remarks": reason
    })

    db.commit()

    return {"message":"Rejected"}

from fastapi import Request

@router.get("/pending-approval")
def pending_approval(
    request: Request,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    warehouse_value = request.headers.get("warehouse")

    if not warehouse_value:
        raise HTTPException(400, "Warehouse not selected")

    # ✅ Handle both id and code
    if str(warehouse_value).isdigit():
        warehouse_id = int(warehouse_value)
    else:
        warehouse_id = db.execute(text("""
            SELECT id FROM warehouses WHERE warehouse_id = :code
        """), {"code": warehouse_value}).scalar()

    data = db.execute(text("""
        SELECT pr.*
        FROM payment_requests pr
        JOIN approval_levels al 
            ON pr.current_level = al.level_no
        JOIN user_warehouses uw 
            ON uw.warehouse_id = pr.warehouse_id
                           
        WHERE pr.status = 'Pending'
        AND al.role_id = :role_id
        AND uw.user_id = :user_id
        AND pr.warehouse_id = :warehouse_id
    """), {
        "role_id": user.role_id,
        "user_id": user.id,
        "warehouse_id": warehouse_id
    }).fetchall()

    # ✅ FIX HERE
    result = [dict(row._mapping) for row in data]

    return result


@router.get("/edit/{id}")
def get_payment_request_for_edit(id: int, db: Session = Depends(get_db)):

    pr = db.query(PaymentRequest).filter(PaymentRequest.id == id).first()

    if not pr:
        raise HTTPException(404, "Request not found")

    invoices = db.query(Invoice).filter(
        Invoice.payment_request_id == id
    ).all()

    invoice_list = []

    for inv in invoices:
        items = db.query(InvoiceItem).filter(
            InvoiceItem.invoice_id == inv.id
        ).all()

        attachment = db.query(Attachment).filter(
            Attachment.invoice_id == inv.id
        ).first()

        invoice_list.append({
            "invoice_id": inv.id,
            "invoice_no": inv.invoice_no,
            "invoice_date": inv.invoice_date,
            "gst_percent": float(inv.gst_percent),
            "attachment": attachment.file_path if attachment else None,
            "items": [
                {
                    "description": item.description,
                    "qty": item.qty,
                    "price": float(item.price),
                } for item in items
            ],
        })

    return {
        "id": pr.id,
        "request_code": pr.request_code,
        "vendor_id": pr.vendor_id,
        "warehouse_id": pr.warehouse_id,
        "status": pr.status,
        "grand_total": float(pr.grand_total),
        "invoices": invoice_list,
    }


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
        "vendor_name": db.query(Vendor.vendor_name).filter(Vendor.id == pr.vendor_id).scalar(),
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
