from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from ..db.models import Token, User
from ..repositories import user as user_repo
from ..repositories.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
    verify_refresh_token,
)
from ..schemas.user import UserRegister
from ..services.activity_log import log_activity
from ..services.rate_limiter import rate_limiter

auth_router = APIRouter(prefix="/auth", tags=["authorization"])


@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister, request: Request):
    ip_address = rate_limiter.get_client_ip(request)
    allowed, retry_after = await rate_limiter.check_registration_limit(ip_address)
    if not allowed:
        log_activity(
            action="registration_attempt",
            ip_address=ip_address,
            user_id=None,
            success=False,
            detail="rate_limit_exceeded",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts from this IP. Try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    existing_user = await user_repo.get_user_by_username_or_email(
        user.username, user.email
    )
    if existing_user:
        log_activity(
            action="registration_attempt",
            ip_address=ip_address,
            user_id=None,
            success=False,
            detail="duplicate_username_or_email",
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    new_user = await user_repo.create_user(
        {
            "username": user.username,
            "email": user.email,
            "hashed_password": get_password_hash(user.password),
        }
    )
    log_activity(
        action="registration",
        ip_address=ip_address,
        user_id=new_user.id,
        success=True,
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
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@auth_router.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_token: Annotated[str, Body(embed=True)]):
    """
    Exchanges a valid refresh token for a new access token.
    """
    username = verify_refresh_token(refresh_token)

    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Fetch fresh user data to get current role
    user = await user_repo.get_user_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    new_access_token = create_access_token(
        data={"sub": username, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # return new access token
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@auth_router.get("/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
    }
