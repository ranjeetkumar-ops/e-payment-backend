# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str):
#     return pwd_context.hash(password)

# def verify_password(plain, hashed):
#     return pwd_context.verify(plain, hashed)

def hash_password(password: str):
    # No hashing for now (testing mode)
    return password


def verify_password(plain, stored):
    # Simple plain compare
    return plain == stored