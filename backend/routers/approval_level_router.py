from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models.approval_level_model import ApprovalLevel
from backend.models.role_model import Role
from backend.schemas.approval_level_schema import ApprovalLevelCreate
from backend.dependencies.role_dependency import admin_only
from backend.dependencies.auth_dependency import get_current_user

router = APIRouter(prefix="/approval-level", tags=["Approval Level"])

# ⭐ GET ALL APPROVAL LEVELS (WITH ROLE NAME)
@router.get("/all")
def get_levels(db: Session = Depends(get_db),
               current=Depends(admin_only)):

    data = db.query(
        ApprovalLevel,
        Role.role_name
    ).join(
        Role, ApprovalLevel.role_id == Role.id
    ).order_by(
        ApprovalLevel.level_no
    ).all()

    result = []

    for level, role_name in data:
        result.append({
            "id": level.id,
            "level_no": level.level_no,
            "role_id": level.role_id,
            "role_name": role_name,
            "level_name": level.level_name
        })

    return result


# ⭐ CREATE LEVEL
@router.post("/create")
def create_level(
        data: ApprovalLevelCreate,
        db: Session = Depends(get_db),
        user=Depends(admin_only)
):

    exist = db.query(ApprovalLevel).filter(
        ApprovalLevel.level_no == data.level_no
    ).first()

    if exist:
        raise HTTPException(400, "Level already exists")

    max_level = db.query(func.max(ApprovalLevel.level_no)).scalar()

    if max_level and data.level_no != max_level + 1:
        raise HTTPException(400, f"Next level must be {max_level+1}")

    level = ApprovalLevel(
        level_no=data.level_no,
        role_id=data.role_id,
        level_name=data.level_name
    )

    db.add(level)
    db.commit()

    return {"message": "Level Created"}


# ⭐ DELETE LEVEL
@router.delete("/delete/{id}")
def delete_level(id: int,
                 db: Session = Depends(get_db),
                 user=Depends(admin_only)):

    level = db.query(ApprovalLevel).filter(
        ApprovalLevel.id == id
    ).first()

    if not level:
        raise HTTPException(404, "Level not found")

    db.delete(level)
    db.commit()

    return {"message": "Level Deleted"}