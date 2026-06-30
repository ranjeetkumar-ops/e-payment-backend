from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.database import get_db
from backend.schemas.user_schema import UserCreate, UserUpdate, UserWarehouseAssign
from backend.crud import user_crud
from backend.dependencies.auth_dependency import get_current_user
from backend.dependencies.role_dependency import admin_only
from typing import Optional, List
from backend.utils.jwt import create_token
from sqlalchemy import text
from fastapi import HTTPException

router = APIRouter(prefix="/users", tags=["Users"])


# 👑 ADMIN ONLY
@router.post("/")
def create(user: UserCreate,
           db: Session = Depends(get_db),
           current=Depends(admin_only)):
    return user_crud.create_user(db, user)


# 🔐 LOGIN REQUIRED
@router.get("/")
def all_users(db: Session = Depends(get_db),
              current=Depends(admin_only)):
    users = user_crud.get_users(db)
    result = []

    for user in users:
        assigned = db.execute(text("""
            SELECT w.id, w.warehouse_name
            FROM user_warehouses uw
            JOIN warehouses w ON w.id = uw.warehouse_id
            WHERE uw.user_id = :user_id
            ORDER BY
                CASE WHEN w.id = :default_warehouse_id THEN 0 ELSE 1 END,
                w.warehouse_name
        """), {
            "user_id": user.id,
            "default_warehouse_id": user.warehouse_id or 0
        }).fetchall()

        assigned_warehouses = [
            {"id": row.id, "warehouse_name": row.warehouse_name}
            for row in assigned
        ]

        result.append({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "role_id": user.role_id,
            "warehouse_id": user.warehouse_id,
            "is_active": user.is_active,
            "assigned_warehouse_ids": [row["id"] for row in assigned_warehouses],
            "assigned_warehouses": assigned_warehouses,
        })

    return result


# 👑 ADMIN ONLY (Better Practice)
@router.put("/{user_id}")
def update(user_id: int,
           data: UserUpdate,
           db: Session = Depends(get_db),
           current=Depends(admin_only)):
    return user_crud.update_user(db, user_id, data)


# 👑 ADMIN ONLY (Very Important)
@router.delete("/{user_id}")
def delete(user_id: int,
           db: Session = Depends(get_db),
           current=Depends(admin_only)):
    return user_crud.delete_user(db, user_id)


@router.put("/{user_id}/role")
def assign_role(user_id: int,
                role_id: int,
                db: Session = Depends(get_db),
                current=Depends(admin_only)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.execute(
        text("SELECT id FROM roles WHERE id = :role_id"),
        {"role_id": role_id}
    ).fetchone()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid Role ID")

    user.role_id = role_id
    db.commit()

    return {"message": "Role assigned", "user_id": user_id, "role_id": role_id}


@router.put("/{user_id}/warehouse")
def assign_warehouse(user_id: int,
                     warehouse_id: int,
                     db: Session = Depends(get_db),
                     current=Depends(admin_only)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    warehouse = db.execute(
        text("SELECT id FROM warehouses WHERE id = :warehouse_id"),
        {"warehouse_id": warehouse_id}
    ).fetchone()
    if not warehouse:
        raise HTTPException(status_code=400, detail="Invalid Warehouse ID")

    user.warehouse_id = warehouse_id
    db.execute(
        text("""
            INSERT INTO user_warehouses (user_id, warehouse_id)
            SELECT :user_id, :warehouse_id
            WHERE NOT EXISTS (
                SELECT 1 FROM user_warehouses
                WHERE user_id = :user_id AND warehouse_id = :warehouse_id
            )
        """),
        {"user_id": user_id, "warehouse_id": warehouse_id}
    )
    db.commit()

    return {
        "message": "Warehouse assigned",
        "user_id": user_id,
        "warehouse_id": warehouse_id
    }


@router.put("/{user_id}/warehouses")
def assign_warehouses(user_id: int,
                      data: UserWarehouseAssign,
                      db: Session = Depends(get_db),
                      current=Depends(admin_only)):
    user = user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    warehouse_ids = list(dict.fromkeys(data.warehouse_ids))
    if not warehouse_ids:
        raise HTTPException(status_code=400, detail="Select at least one warehouse")

    warehouses = db.execute(
        text("SELECT id FROM warehouses WHERE id IN :warehouse_ids"),
        {"warehouse_ids": tuple(warehouse_ids)}
    ).fetchall()
    found_ids = {row.id for row in warehouses}
    missing_ids = [warehouse_id for warehouse_id in warehouse_ids if warehouse_id not in found_ids]

    if missing_ids:
        raise HTTPException(status_code=400, detail=f"Invalid Warehouse ID: {missing_ids[0]}")

    user.warehouse_id = warehouse_ids[0]

    db.execute(
        text("DELETE FROM user_warehouses WHERE user_id = :user_id"),
        {"user_id": user_id}
    )

    for warehouse_id in warehouse_ids:
        db.execute(
            text("""
                INSERT INTO user_warehouses (user_id, warehouse_id)
                VALUES (:user_id, :warehouse_id)
            """),
            {"user_id": user_id, "warehouse_id": warehouse_id}
        )

    db.commit()

    return {
        "message": "Warehouses assigned",
        "user_id": user_id,
        "warehouse_ids": warehouse_ids
    }
