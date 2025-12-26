from sqlalchemy.orm import Session
import orm_models 
import schemas
from fastapi import HTTPException

def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    
    total = 0.0
    db_order = orm_models.Order(user_id=user_id, total=0.0, status="pending")
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        
        db_product = db.query(orm_models.Product).filter(orm_models.Product.id == item.product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if db_product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {db_product.name} (available: {db_product.quantity})")
        
        price_at_purchase = db_product.price
        subtotal = price_at_purchase * item.quantity
        total += subtotal

        db_item = orm_models.OrderItem(
            order_id = db_order.id,
            product_id = item.product_id,
            quantity = item.quantity,
            price_at_purchase = price_at_purchase
        )
        db.add(db_item)
        db_product.quantity -= item.quantity #update stock
        db.add(db_product)

    db_order.total = total
    db_order.status = "confirmed"
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session, user_id:int):
    return db.query(orm_models.Order).filter(orm_models.Order.user_id == user_id).all()

def get_order_by_id(db: Session, order_id: int, user_id: int):
    return db.query(orm_models.Order).filter(orm_models.Order.id == order_id, orm_models.Order.user_id == user_id).first()



