from fastapi import HTTPException, Depends
from backend.dependencies.auth_dependency import get_current_user


def admin_only(current=Depends(get_current_user)):

    if current.role_id != 1:
        raise HTTPException(status_code=403, detail="Admin Only")

    return current  