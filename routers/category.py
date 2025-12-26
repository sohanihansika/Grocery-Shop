from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import orm_models as orm_models
import schemas as schemas
from database import get_db
import crud.category as category_crud
from utils.auth import get_current_admin, get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    return category_crud.get_all_categories(db)

@router.get("/{category_id}", response_model= schemas.Category)
def get_category(category_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    db_category = category_crud.get_category_by_id(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.post("/", response_model=schemas.Category)
def add_category(category: schemas.CategoryBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_admin)):
    return category_crud.add_category(db, category)

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_admin)):
    db_category = category_crud.update_category(db, category_id, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_admin)):
    db_category = category_crud.delete_category(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted"}

