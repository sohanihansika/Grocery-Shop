from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
import crud.order as order_crud
from utils.auth import get_current_customer

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_customer)):
    db_order = order_crud.create_order(db, order, current_user.id)
    return db_order

@router.get("/", response_model=List[schemas.Order])
def get_orders(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_customer)):
    return order_crud.get_orders(db, current_user.id)

@router.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_customer)):
    db_order = order_crud.get_order_by_id(db, order_id, current_user.id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order