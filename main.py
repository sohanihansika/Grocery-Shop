from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import orm_models as orm_models
from database import engine, get_db 
from sqlalchemy.orm import Session
from sqlalchemy.exc import ProgrammingError, OperationalError
import logging
import schemas as schemas
import routers.product as product_router
import routers.category as category_router
import routers.auth as auth_router
import routers.order as order_router
from utils.auth import hash_password  # For admin seeding

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(product_router.router)
app.include_router(category_router.router)
app.include_router(auth_router.router)
app.include_router(order_router.router)

# Initial DB setup and seeding
def init_db():
    db = None
    try:
        db = next(get_db())
        # Test query to detect schema mismatch (e.g., missing columns)
        db.query(orm_models.User).count()
    except (ProgrammingError, OperationalError) as e:
        logging.warning("Database schema mismatch detected: %s", e)
        logging.warning("Recreating database tables to match ORM models...")
        orm_models.Base.metadata.drop_all(bind=engine)
        orm_models.Base.metadata.create_all(bind=engine)
        if db:
            db.close()
        db = next(get_db())  # Re-get db after recreate

    # Seed admin if none exists (only one admin)
    admin_count = db.query(orm_models.User).filter(orm_models.User.role == "ADMIN").count()
    if admin_count == 0:
        admin_email = "admin@gmail.com"  
        admin_password = "admin" 
        hashed_pw = hash_password(admin_password)
        admin = orm_models.User(email=admin_email, hashed_password=hashed_pw, role="ADMIN")
        db.add(admin)
        db.commit()
        logging.info("Admin user created successfully")

init_db()

@app.get("/")
def greet():
    return "Welcome!!!!"