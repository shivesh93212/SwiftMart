from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from database import create_db_and_tables, get_session
from models import User, Product, Cart
from dotenv import load_dotenv
import os

# Load .env (works locally; Render uses environment variables directly)
load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "")
ALGORITHM: str = os.getenv("ALGORITHM", "")

if not SECRET_KEY or not ALGORITHM:
    raise ValueError("SECRET_KEY and ALGORITHM must be set in Render Environment Variables!")

app = FastAPI()

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# DB STARTUP
# -------------------------------
@app.on_event("startup")
def startup():
    print("🚀 Starting up… creating tables if missing")
    create_db_and_tables()


# -------------------------------
# JWT TOKEN
# -------------------------------
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(hours=2)
    data.update({"exp": expire})
    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return token


# -------------------------------
# SIGNUP
# -------------------------------
class SignupModel(BaseModel):
    name: str
    email: str
    password: str

@app.post("/signup")
def signup(data: SignupModel, session: Session = Depends(get_session)):
    user_exists = session.exec(select(User).where(User.email == data.email)).first()

    if user_exists:
        raise HTTPException(400, "User already exists")

    user = User(
        name=data.name,
        email=data.email,
        password=data.password
    )

    session.add(user)
    session.commit()

    return {"message": "Signup successful!"}


# -------------------------------
# LOGIN
# -------------------------------
class LoginModel(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(data: LoginModel, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user:
        raise HTTPException(404, "User not found")

    if user.password != data.password:
        raise HTTPException(401, "Incorrect password")

    token = create_access_token({"sub": user.email})

    return {"message": "Login successful!", "token": token, "user_id": user.id}


# -------------------------------
# PRODUCTS
# -------------------------------
@app.get("/products")
def get_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return {"products": products}


@app.post("/add-products")
def add_products(session: Session = Depends(get_session)):
    existing = session.exec(select(Product)).all()

    if existing:
        return {"message": "Products already exist!"}

    items = [
        Product(name="Lays", price=55, image="img1.avif"),
        Product(name="Milk", price=40, image="img9.avif"),
        Product(name="Bread", price=45, image="img8.avif"),
        Product(name="Peanuts", price=220, image="img5.avif"),
        Product(name="Butter", price=66, image="img10.avif"),
    ]

    for p in items:
        session.add(p)

    session.commit()
    return {"message": 'Products added successfully!'}


# -------------------------------
# CART: Add Item
# -------------------------------
@app.post("/cart/add/{user_id}/{product_id}")
def add_to_cart(user_id: int, product_id: int, session: Session = Depends(get_session)):

    existing = session.exec(
        select(Cart).where(Cart.user_id == user_id, Cart.product_id == product_id)
    ).first()

    if existing:
        existing.quantity += 1
        session.add(existing)
    else:
        item = Cart(user_id=user_id, product_id=product_id, quantity=1)
        session.add(item)

    session.commit()
    return {"message": "Item added to cart"}


# -------------------------------
# CART: Get Items
# -------------------------------
@app.get("/cart/{user_id}")
def get_cart(user_id: int, session: Session = Depends(get_session)):
    items = session.exec(select(Cart).where(Cart.user_id == user_id)).all()

    output = []
    for item in items:
        product = session.get(Product, item.product_id)
        if product:
            output.append({
                "name": product.name,
                "price": product.price,
                "image": product.image,
                "quantity": item.quantity,
                "product_id": product.id
            })

    return {"cart": output}


# -------------------------------
# CART: Remove Item
# -------------------------------
@app.delete("/cart/remove/{user_id}/{product_id}")
def remove_item(user_id: int, product_id: int, session: Session = Depends(get_session)):
    item = session.exec(
        select(Cart).where(Cart.user_id == user_id, Cart.product_id == product_id)
    ).first()

    if not item:
        raise HTTPException(404, "Item not found in cart")

    if item.quantity > 1:
        item.quantity -= 1
        session.add(item)
    else:
        session.delete(item)

    session.commit()
    return {"message": "Item removed"}
