from typing import List
from pydantic import BaseModel, EmailStr, field_validator

class CategoryBase(BaseModel):
    name: str
    description: str | None = None

class Category(CategoryBase):
    id: int
    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    quantity: int
    category_id: int

    @field_validator('price')
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price must be positive")
        return v
    
    @field_validator('quantity')
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity must be non-negative")
        return v
    
class Product(ProductBase):
        id: int
        category: Category | None = None

        # Pydantic v2: allow creating this model from ORM/SQLAlchemy objects
        # so FastAPI can return SQLAlchemy rows directly when using response_model.
        model_config = {"from_attributes": True}

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str

    model_config = {"from_attributes": True}

class Login(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float

    model_config = {"from_attributes": True}

class Order(BaseModel):
    id: int
    total: float
    status: str
    items: List[OrderItem] = []

    model_config = {"from_attributes": True}
