from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import orm_models as orm_models
import schemas as schemas
from database import get_db
import crud.product as product_crud
from utils.auth import get_current_admin, get_current_user

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[schemas.Product])
def get_products(db: Session = Depends(get_db),  current_user: schemas.User = Depends(get_current_user)):
    return product_crud.get_all_products(db)

@router.get("/cat/{category_id}", response_model=List[schemas.Product])
def get_products_by_category(category_id: int, db: Session = Depends(get_db),  current_user: schemas.User = Depends(get_current_user)):
    db_products = product_crud.get_product_by_category_id(db, category_id)
    return db_products

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db),  current_user: schemas.User = Depends(get_current_user)):
    db_product = product_crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.post("/", response_model=schemas.Product)
def add_product(product: schemas.ProductBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_admin)):
    if not db.query(orm_models.Category).filter(orm_models.Category.id == product.category_id).first():
        raise HTTPException(status_code=400, detail="Category not found")
    return product_crud.add_product(db, product)

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_admin)):
    if not db.query(orm_models.Category).filter(orm_models.Category.id == product.category_id).first():
        raise HTTPException(status_code=400, detail="Category not found")
    db_product = product_crud.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_admin)):
    db_product = product_crud.delete_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}
