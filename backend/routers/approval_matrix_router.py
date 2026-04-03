from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.dependencies.role_dependency import admin_only
from backend.models.approval_matrix_model import ApprovalMatrix
#from backend.utils.dependency import get_current_user
from backend.dependencies.auth_dependency import get_current_user
from backend.dependencies.role_dependency import admin_only

router = APIRouter(prefix="/approval-matrix", tags=["Approval Matrix"])


@router.post("/create")
def create_matrix(
        min_amount: float,
        max_amount: float,
        level_no: int,
        db: Session = Depends(get_db),
        user=Depends(admin_only)
):

    rule = ApprovalMatrix(
        min_amount=min_amount,
        max_amount=max_amount,
        level_no=level_no
    )

    db.add(rule)
    db.commit()

    return {"message": "Matrix Rule Created"}

# Get All Matrix Rules 
@router.get("/all")
def get_matrix(
        db: Session = Depends(get_db),
        user=Depends(admin_only)
):
    return db.query(ApprovalMatrix).all()

# Delete Matrix Rule
@router.delete("/delete/{id}")
def delete_matrix(
        id: int,
        db: Session = Depends(get_current_user),
        user=Depends(admin_only)
):

    rule = db.query(ApprovalMatrix).filter(
        ApprovalMatrix.id == id
    ).first()

    db.delete(rule)
    db.commit()

    return {"message": "Rule Deleted"}