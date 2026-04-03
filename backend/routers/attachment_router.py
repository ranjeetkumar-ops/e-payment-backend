from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
import os
from backend.database import get_db
from backend.models.attachment_model import Attachment

router = APIRouter(
    prefix="/attachments",
    tags=["Attachments"]
)

UPLOAD_FOLDER = "uploads"

@router.post("/upload")
def upload_attachment(
    invoice_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    file_location = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    att = Attachment(
        invoice_id=invoice_id,
        file_path=file_location
    )

    db.add(att)
    db.commit()
    db.refresh(att)

    return {
        "msg": "File Uploaded",
        "file_path": file_location
    }