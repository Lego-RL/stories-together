import pytest
from httpx import AsyncClient


class TestAdmin:
    @pytest.mark.asyncio
    async def test_get_users_empty(self, client: AsyncClient):
        """Test getting users when no users exist."""
        response = await client.get("/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_users_with_data(self, client: AsyncClient):
        """Test getting users when users exist."""
        # Create some test users
        user1 = {
            "username": "user1",
            "email": "user1@example.com",
            "password": "password123",
        }
        user2 = {
            "username": "user2",
            "email": "user2@example.com",
            "password": "password123",
        }

        await client.post("/auth/register", params=user1)
        await client.post("/auth/register", params=user2)

        response = await client.get("/admin/users")
        assert response.status_code == 200
        data = response.json()
        print(f"{data=}")
        assert isinstance(data, list)
        assert len(data) == 2

        # Check structure
        for user in data:
            assert "username" in user
            assert "email" in user
            assert user["username"] in ["user1", "user2"]
            assert user["email"] in ["user1@example.com", "user2@example.com"]

    @pytest.mark.asyncio
    async def test_view_user_content_not_found(self, client: AsyncClient):
        """Test viewing content for a non-existent user."""
        response = await client.get("/admin/users/999")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "User not found"

    @pytest.mark.asyncio
    async def test_view_user_content_success(self, client: AsyncClient, login_user):
        """Test viewing content for an existing user."""
        # Get the user ID from login_user fixture
        user_id = login_user["user"]["id"]

        response = await client.get(f"/admin/users/{user_id}")
        assert response.status_code == 200
        data = response.json()

        # Check structure
        assert "username" in data
        assert "email" in data
        assert "stories" in data
        assert "passages" in data
        assert isinstance(data["stories"], list)
        assert isinstance(data["passages"], list)

        # Since this is a new user, should have empty lists
        assert len(data["stories"]) == 0
        assert len(data["passages"]) == 0

    @pytest.mark.asyncio
    async def test_view_user_content_with_stories_and_passages(
        self, client: AsyncClient, login_user, populate_stories
    ):
        """Test viewing content for a user who has created stories and passages."""
        
        user_id = login_user["user"]["id"]
        auth_headers = login_user["headers"]

        
        story_payload = {
            "title": "Test Story",
            "description": "A test story",
            "first_passage_content": "This is the beginning of the story.",
        }
        story_response = await client.post(
            "/stories/", json=story_payload, headers=auth_headers
        )
        assert story_response.status_code == 201
        story_data = story_response.json()

        
        passage_payload = {
            "content": "This is a continuation of the story.",
            "previous_passage_id": story_data["first_passage"]["id"],
        }
        passage_response = await client.post(
            f"/stories/{story_data['id']}/passages",
            json=passage_payload,
            headers=auth_headers,
        )
        assert passage_response.status_code == 201

        
        response = await client.get(f"/admin/users/{user_id}")
        assert response.status_code == 200
        data = response.json()

        assert len(data["stories"]) == 1
        assert len(data["passages"]) == 2  

        # Check story structure
        story = data["stories"][0]
        assert "id" in story
        assert "title" in story
        assert "description" in story
        assert story["title"] == "Test Story"

        # Check passages structure
        for passage in data["passages"]:
            assert "id" in passage
            assert "content" in passage
            assert "story_id" in passage
