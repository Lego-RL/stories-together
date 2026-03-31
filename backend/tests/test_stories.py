import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_story_authenticated(client: AsyncClient):
    """Test that a logged-in user can successfully create a story."""

    # create user
    user_creds = {
        "username": "bard",
        "email": "bard@test.com",
        "password": "secret_password",
    }
    await client.post("/auth/register", params=user_creds)

    # login, get token back
    login_res = await client.post(
        "/auth/login", data={"username": "bard", "password": "secret_password"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    story_payload = {
        "title": "The Dragon",
        "description": "A story about a dragon.",
        "first_passage_content": "There once was a dragon... or was there?",
    }

    # create story
    response = await client.post("/stories/", json=story_payload, headers=headers)

    # ensure story successfully created
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "The Dragon"
    assert "id" in data
    assert data["creator_id"] is not None


@pytest.mark.asyncio
async def test_create_story_unauthorized(client: AsyncClient):
    """Test that creating a story without a token fails with 401."""
    story_payload = {
        "title": "The Stolen Tale",
        "first_passage_content": "I am writing without permission.",
    }

    # post without authorization
    response = await client.post("/stories/", json=story_payload)

    # ensure "unauthorized" status code
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_add_passage_to_story(client, login_user):
    """
    Use a logged-in user to create a story and add a passage to the story.
    """

    auth = login_user["headers"]

    # sample story
    story_payload = {
        "title": "The Loop",
        "description": "All about the creation of the digit 8",
        "first_passage_content": "It all started with the sun",
    }
    story_res = await client.post("/stories/", json=story_payload, headers=auth)
    story_id = story_res.json()["id"]

    # get initial passage id via tree endpoint
    tree_res = await client.get(f"/stories/{story_id}/tree")
    root_passage_id = tree_res.json()[0]["id"]

    passage_payload = {
        "content": "But then the runtime error appeared.",
        "parent_passage_id": root_passage_id,
    }

    # add passage onto story
    response = await client.post(
        f"/stories/{story_id}/passages", json=passage_payload, headers=auth
    )

    assert response.status_code == 201
    data = response.json()
    assert data["content"] == passage_payload["content"]
    assert data["parent_passage_id"] == root_passage_id
    assert data["story_id"] == story_id
