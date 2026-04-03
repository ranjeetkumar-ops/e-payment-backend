from fastapi import Depends, HTTPException
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "EPAYMENTSECRET"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(
        token: HTTPAuthorizationCredentials = Depends(security)):

    try:
        payload = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except:
        raise HTTPException(status_code=401, detail="Invalid Token")

