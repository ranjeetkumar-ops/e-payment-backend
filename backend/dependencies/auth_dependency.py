# from fastapi import Depends, HTTPException
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from jose import jwt, JWTError

# from backend.utils.jwt_handler import SECRET_KEY, ALGORITHM

# security = HTTPBearer()


# def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    

#     try:
#         payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])

#         return payload

#     except JWTError:
#         raise HTTPException(status_code=403, detail="Invalid Token")

# from fastapi import Depends, HTTPException
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from jose import jwt, JWTError
# from sqlalchemy.orm import Session, joinedload

# from backend.database import get_db
# from backend.models.user_model import User
# from backend.utils.jwt import SECRET_KEY, ALGORITHM
# from backend.utils.jwt import create_token

# security = HTTPBearer()

# def get_current_user(
#         token: HTTPAuthorizationCredentials = Depends(security),
#         db: Session = Depends(get_db)
# ):
#     try:
#         payload = jwt.decode(
#             token.credentials,
#             SECRET_KEY,
#             algorithms=[ALGORITHM]
#         )

#         user_id = payload.get("sub")

#         if not user_id:
#             raise HTTPException(status_code=401, detail="Invalid Token")

#         user = db.query(User).options(
#             joinedload(User.role)
#         ).filter(User.id == user_id).first()

#         if not user:
#             raise HTTPException(status_code=401, detail="User Not Found")

#         return user

#     except JWTError:
#         raise HTTPException(status_code=401, detail="Token Decode Failed")

# from fastapi import Depends, HTTPException
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from jose import jwt, JWTError
# from sqlalchemy.orm import Session

# from backend.database import get_db
# from backend.models.user_model import User
# from backend.utils.jwt import SECRET_KEY, ALGORITHM   # ⭐ IMPORTANT

# security = HTTPBearer()

# def get_current_user(
#     token: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ):
#     try:
#         payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])

#         user_id = payload.get("sub")

#         if not user_id:
#             raise HTTPException(status_code=401, detail="Invalid Token")

#         user = db.query(User).filter(User.id == user_id).first()

#         if not user:
#             raise HTTPException(status_code=401, detail="User Not Found")

#         return user

#     except JWTError:
#         raise HTTPException(status_code=401, detail="Token Decode Failed")

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user_model import User
from backend.utils.jwt import SECRET_KEY, ALGORITHM   # ⭐ ONLY THIS IMPORT

security = HTTPBearer()

def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
     
     
        user_id = int(payload.get("sub"))

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid Token")
            user_id = int(user_id)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User Not Found")

        return user

    except JWTError as e:
        print("JWT ERROR =", e)   # ⭐ VERY IMPORTANT
        raise HTTPException(status_code=401, detail="Token Decode Failed")