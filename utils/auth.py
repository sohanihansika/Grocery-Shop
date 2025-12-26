from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import orm_models
from database import get_db

SECRET_KEY = "481532b122b8eea686ecbb3c5260de672d7fe37ef7fad5001d8f549f6a2aa924"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expires = datetime.now(timezone.utc) + expires_delta
    else:
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expires})
    if 'role' in data:
        to_encode['role'] = data['role']
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credential_exception
    except JWTError:
        raise credential_exception
    user = db.query(orm_models.User).filter(orm_models.User.email == email).first()
    if user is None:
        raise credential_exception
    return user

def get_current_admin(current_user: orm_models.User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_customer(current_user: orm_models.User = Depends(get_current_user)):
    if current_user.role != "USER":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user