from sqlalchemy.orm import Session
import orm_models as orm_models
import schemas as schemas

def get_all_products(db: Session):
    return db.query(orm_models.Product).all()

def get_product_by_id(db: Session, product_id: int):
    return db.query(orm_models.Product).filter(orm_models.Product.id == product_id).first()

def get_product_by_category_id(db: Session, category_id: int):
    return db.query(orm_models.Product).filter(orm_models.Product.category_id == category_id).all()

def add_product(db: Session, product: schemas.ProductBase):
    db_product = orm_models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductBase):
    db_product = get_product_by_id(db, product_id)
    if db_product:
        for key, value in product.model_dump().items():
            if hasattr(db_product, key):
                setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product_by_id(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

    