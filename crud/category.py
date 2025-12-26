from sqlalchemy.orm import Session
import orm_models as orm_models
import schemas as schemas

def get_all_categories(db: Session):
    return db.query(orm_models.Category).all()

def get_category_by_id(db: Session, category_id: int):
    return db.query(orm_models.Category).filter(orm_models.Category.id == category_id).first()

def add_category(db: Session, category: schemas.CategoryBase):
    db_category = orm_models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryBase):
    db_category = get_category_by_id(db, category_id)
    if db_category:
        for key, value in category.model_dump().items():
            if hasattr(db_category, key):
                setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category_by_id(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category
    