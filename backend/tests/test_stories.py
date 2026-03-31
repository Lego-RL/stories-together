import pytest
from httpx import AsyncClient, HTTPStatusError

@pytest.mark.asyncio
async def test_create_story_authenticated(client: AsyncClient):
    """Test that a logged-in user can successfully create a story."""
    
    # create user
    user_creds = {"username": "bard", "email": "bard@test.com", "password": "secret_password"}
    await client.post("/auth/register", params=user_creds)
    
    # login, get token back
    login_res = await client.post("/auth/login", data={
        "username": "bard", 
        "password": "secret_password"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # create story
    story_payload = {
        "title": "The Dragon's Echo",
        "description": "A tale of old mountains.",
        "first_passage_content": "The wind howled through the granite peaks..."
    }
    
    response = await client.post("/stories/", json=story_payload, headers=headers)

    # ensure story successfully created
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "The Dragon's Echo"
    assert "id" in data
    assert data["creator_id"] is not None


@pytest.mark.asyncio
async def test_create_story_unauthorized(client: AsyncClient):
    """Test that creating a story without a token fails with 401."""
    story_payload = {
        "title": "The Stolen Tale",
        "first_passage_content": "I am writing without permission."
    }

    # post without authorization
    response = await client.post("/stories/", json=story_payload)

    # ensure "unauthorized" status code
    assert response.status_code == 401