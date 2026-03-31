import os

from dotenv import load_dotenv

load_dotenv(dotenv_path="tests/.env.test", override=True)
TEST_DATABASE_URL = os.getenv("DATABASE_URL")

# ruff: disable[E402] (having code before imports)
# dotenv needs to load prior to production db url being loaded from other module
import pytest_asyncio
from app.db import session
from app.db.models import Base
from app.server import app
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """
    Provide a test database client to utilize during testing
    """

    test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

    TestSessionLocal = async_sessionmaker(bind=test_engine, expire_on_commit=False)

    session.SessionLocal = TestSessionLocal

    await test_engine.dispose()
    # create tables in the test database
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # drop tables after all tests are done
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await test_engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def client():
    """
    Provide AsyncClient to send test requests to API
    """
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture(scope="function")
async def login_user(client: AsyncClient):
    """
    Use with endpoints that expect a user to be logged in.
    Returns dict of login endpoint response `user` and constructed auth header `headers`.
    """

    # create user
    user_creds = {
        "username": "happy_user",
        "email": "happy_user@smile.com",
        "password": "secret_password",
    }
    await client.post("/auth/register", params=user_creds)

    # login, get token back
    login_res = await client.post(
        "/auth/login",
        data={"username": user_creds["username"], "password": user_creds["password"]},
    )
    token = login_res.json()["access_token"]

    return {"user": login_res.json(), "headers": {"Authorization": f"Bearer {token}"}}
