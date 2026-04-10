import os

from dotenv import load_dotenv

load_dotenv(dotenv_path="tests/.env.test", override=True)
TEST_DATABASE_URL = os.getenv("DATABASE_URL")

# ruff: disable[E402] (having code before imports)
# dotenv needs to load prior to production db url being loaded from other module
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from ..app.db import session
from ..app.db.models import Base
from ..app.server import app


@pytest_asyncio.fixture(scope="class", autouse=True)
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
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
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


@pytest_asyncio.fixture(scope="class")
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
    await client.post("/auth/register", json=user_creds)

    # login, get token back
    login_res = await client.post(
        "/auth/login",
        data={"username": user_creds["username"], "password": user_creds["password"]},
    )
    token = login_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    me_res = await client.get("/auth/me", headers=auth_headers)
    return {"user": me_res.json(), "headers": auth_headers}


@pytest_asyncio.fixture(scope="class")
async def login_admin_user(client: AsyncClient):
    """
    Create an admin user and return auth headers.
    Returns dict of login endpoint response `user` and constructed auth header `headers`.
    """
    from sqlalchemy import update

    from ..app.db import session
    from ..app.db.models import User

    user_creds = {
        "username": "admin_user",
        "email": "admin@example.com",
        "password": "admin_password",
    }
    await client.post("/auth/register", json=user_creds)

    # Update user role to admin in the database
    async with session.SessionLocal() as db:
        stmt = update(User).where(User.username == "admin_user").values(role="admin")
        await db.execute(stmt)
        await db.commit()

    # Login
    login_res = await client.post(
        "/auth/login",
        data={"username": user_creds["username"], "password": user_creds["password"]},
    )
    token = login_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    me_res = await client.get("/auth/me", headers=auth_headers)
    return {"user": me_res.json(), "headers": auth_headers}


@pytest_asyncio.fixture(scope="class")
async def populate_stories(client: AsyncClient, login_user):
    """
    Create several stories to add to the test db.
    """

    auth = login_user["headers"]

    # sample stories
    stories_to_seed = [
        {"title": "The Dragon's Echo", "first_passage_content": "Once upon a time..."},
        {"title": "The Infinite Loop", "first_passage_content": "While True:"},
        {
            "title": "Echoes of the Past",
            "first_passage_content": "The history is deep...",
        },
        {"title": "Crimson Skies", "first_passage_content": "The clouds were red."},
    ]

    for story in stories_to_seed:
        await client.post("/stories/", json=story, headers=auth)
