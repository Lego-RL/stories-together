import os

import pytest_asyncio
from app.db import session
from app.db.models import Base
from app.server import app
from dotenv import load_dotenv
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

# load test environment variables
load_dotenv(dotenv_path="tests/.env.test")
TEST_DATABASE_URL = os.getenv("DATABASE_URL")


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():

    test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

    TestSessionLocal = async_sessionmaker(bind=test_engine, expire_on_commit=False)

    session.SessionLocal = TestSessionLocal

    await test_engine.dispose()
    # create tables in the test database
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # drop tables after all tests are done
    # async with test_engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)

    await test_engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
