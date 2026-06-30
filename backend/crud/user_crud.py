from sqlalchemy.orm import Session
from backend.models.user_model import User
from backend.utils.security import hash_password
from fastapi import HTTPException
from backend.models.role_model import Role
from backend.models.warehouse_model import Warehouse
from sqlalchemy import text

def create_user(db: Session, user):
    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if not role:
            raise HTTPException(status_code=400, detail="Invalid Role ID")

    if user.warehouse_id:
        warehouse = db.query(Warehouse).filter(Warehouse.id == user.warehouse_id).first()
        if not warehouse:
            raise HTTPException(status_code=400, detail="Invalid Warehouse ID")

    db_user = User(
        username=user.username,
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role_id=user.role_id,
        warehouse_id=user.warehouse_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user.warehouse_id:
        db.execute(
            text("""
                INSERT INTO user_warehouses (user_id, warehouse_id)
                SELECT :user_id, :warehouse_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_warehouses
                    WHERE user_id = :user_id AND warehouse_id = :warehouse_id
                )
            """),
            {"user_id": db_user.id, "warehouse_id": user.warehouse_id}
        )
        db.commit()

    return db_user


def get_users(db: Session):
    return db.query(User).all()


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


# def update_user(db: Session, user_id: int, data):
#     user = get_user(db, user_id)

#     if not user:
#         raise HTTPException(status_code:404, detail="User not Found")

#     if data.password:
#         user.password = hash_password(data.password)

#     if data.username:
#         user.username = data.username

#     if data.email:
#         user.email = data.email
    
#     if data.role_id:
#         user.role_id = data.role_id

#     if data.is_active is not None:
#         user.is_active = data.is_active
    

#     db.commit()
#     db.refresh(user)
#     return user

def update_user(db: Session, user_id: int, data):

    user = get_user(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ⭐ Password Update (Hash)
    if data.password:
        user.password = hash_password(data.password)

    # ⭐ Username
    if data.username:
        user.username = data.username

    if data.name:
        user.name = data.name

    # ⭐ Email
    if data.email:
        user.email = data.email

    # ⭐ Role Validation (IMPORTANT FIX)
    if data.role_id:
        role = db.query(Role).filter(Role.id == data.role_id).first()

        if not role:
            raise HTTPException(status_code=400, detail="Invalid Role ID")

        user.role_id = data.role_id

    if data.warehouse_id:
        warehouse = db.query(Warehouse).filter(Warehouse.id == data.warehouse_id).first()

        if not warehouse:
            raise HTTPException(status_code=400, detail="Invalid Warehouse ID")

        user.warehouse_id = data.warehouse_id
        db.execute(
            text("""
                INSERT INTO user_warehouses (user_id, warehouse_id)
                SELECT :user_id, :warehouse_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_warehouses
                    WHERE user_id = :user_id AND warehouse_id = :warehouse_id
                )
            """),
            {"user_id": user.id, "warehouse_id": data.warehouse_id}
        )

    # ⭐ Active Status
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)

    return {
        "message": f"User ID {user_id} updated successfully",
        "user_id": user.id
    }
    


# def delete_user(db: Session, user_id: int):
#     user = get_user(db, user_id)
#     db.delete(user)
#     db.commit()

def delete_user(db: Session, user_id: int):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {
         f"User ID {user_id} deleted successfully"
    }
