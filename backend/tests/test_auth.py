import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_flow_and_me_endpoint(client: AsyncClient):
    """
    Test that a user is able to successfully register an account, login and
    use the /auth/me endpoint to see their user information.
    """

    # 1. setup test data
    user_credentials = {
        "username": "testauthor1",
        "email": "test1@example.com",
        "password": "securepassword123",
    }

    # 2. register new user
    reg_res = await client.post("/auth/register", json=user_credentials)
    assert reg_res.status_code == 201

    # 3. login to get JWT
    login_data = {
        "username": user_credentials["username"],
        "password": user_credentials["password"],
    }

    login_res = await client.post("/auth/login", data=login_data)
    assert login_res.status_code == 200

    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 4. use token to access /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await client.get("/auth/me", headers=headers)

    assert me_res.status_code == 200
    user_info = me_res.json()
    assert user_info["username"] == user_credentials["username"]
    assert user_info["email"] == user_credentials["email"]
    assert "id" in user_info
