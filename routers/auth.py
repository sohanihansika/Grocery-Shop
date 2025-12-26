from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas
from database import get_db
from utils.auth import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import orm_models

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(orm_models.User).filter(orm_models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = hash_password(user.password)
    db_user = orm_models.User(
        email=user.email,
        hashed_password=hashed_pw,
        role="USER"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.Login, db: Session = Depends(get_db)):
    db_user = db.query(orm_models.User).filter(orm_models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}