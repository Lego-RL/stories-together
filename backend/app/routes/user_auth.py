from datetime import timedelta
from typing import Annotated

# from app.db.session import get_db
from app.db.models import Token, User
from app.repositories import user as user_repo
from app.repositories.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter(prefix="/auth", tags=["authorization"])


@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(username: str, email: str, password: str):
    existing_user = await user_repo.get_user_by_username_or_email(username, email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    await user_repo.create_user(
        {
            "username": username,
            "email": email,
            "hashed_password": get_password_hash(password),
        }
    )
    return {"message": "User created successfully"}


@auth_router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await user_repo.get_user_by_username(form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.get("/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
