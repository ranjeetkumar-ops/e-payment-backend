# from jose import jwt
# from datetime import datetime, timedelta

# SECRET_KEY = "EPAYMENTSECRET"
# ALGORITHM = "HS256"

# def create_token(data: dict):
#     to_encode = data.copy()

#     expire = datetime.utcnow() + timedelta(hours=8)

#     to_encode.update({"exp": expire})

#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "EPAYMENTSECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 500


def create_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire , 
        "iat":datetime.utcnow()})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt