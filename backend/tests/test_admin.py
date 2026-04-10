import pytest
from httpx import AsyncClient


class TestAdminAuth:
    """Tests for admin endpoint authentication and authorization."""

    @pytest.mark.asyncio
    async def test_get_users_unauthenticated(self, client: AsyncClient):
        """Test that unauthenticated requests to /admin/users return 401."""
        response = await client.get("/admin/users")
        assert response.status_code == 401
        assert "detail" in response.json()

    @pytest.mark.asyncio
    async def test_get_users_forbidden_non_admin(self, client: AsyncClient, login_user):
        """Test that non-admin users get 403 Forbidden on /admin/users."""
        auth_headers = login_user["headers"]
        response = await client.get("/admin/users", headers=auth_headers)
        assert response.status_code == 403
        assert "permission" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_view_user_content_unauthenticated(
        self, client: AsyncClient, login_user
    ):
        """Test that unauthenticated requests to /admin/users/{id} return 401."""
        user_id = login_user["user"]["id"]
        response = await client.get(f"/admin/users/{user_id}")
        assert response.status_code == 401
        assert "detail" in response.json()

    @pytest.mark.asyncio
    async def test_view_user_content_forbidden_non_admin(
        self, client: AsyncClient, login_user
    ):
        """Test that non-admin users get 403 Forbidden on /admin/users/{id}."""
        user_id = login_user["user"]["id"]
        auth_headers = login_user["headers"]
        response = await client.get(f"/admin/users/{user_id}", headers=auth_headers)
        assert response.status_code == 403
        assert "permission" in response.json()["detail"].lower()


class TestAdmin:
    """Tests for admin endpoints with proper authentication."""

    @pytest.mark.asyncio
    async def test_get_users_empty(self, client: AsyncClient, login_admin_user):
        """Test getting users when no users exist (admin access)."""
        auth_headers = login_admin_user["headers"]
        response = await client.get("/admin/users", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least the admin user and the login_user from other tests
        assert len(data) >= 1

    @pytest.mark.asyncio
    async def test_get_users_with_data(self, client: AsyncClient, login_admin_user):
        """Test getting users when users exist (admin access)."""
        auth_headers = login_admin_user["headers"]

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

        await client.post("/auth/register", json=user1)
        await client.post("/auth/register", json=user2)

        response = await client.get("/admin/users", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        print(f"{data=}")
        assert isinstance(data, list)
        assert len(data) >= 2

        # Check structure
        usernames = [user["username"] for user in data]
        assert "user1" in usernames
        assert "user2" in usernames

        for user in data:
            assert "username" in user
            assert "email" in user

    @pytest.mark.asyncio
    async def test_view_user_content_not_found(
        self, client: AsyncClient, login_admin_user
    ):
        """Test viewing content for a non-existent user (admin access)."""
        auth_headers = login_admin_user["headers"]
        response = await client.get("/admin/users/999", headers=auth_headers)
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "User not found"

    @pytest.mark.asyncio
    async def test_view_user_content_success(
        self, client: AsyncClient, login_user, login_admin_user
    ):
        """Test viewing content for an existing user without content (admin access)."""
        user_id = login_user["user"]["id"]
        admin_headers = login_admin_user["headers"]

        response = await client.get(f"/admin/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()

        # check user structure
        assert "username" in data
        assert "email" in data
        assert "stories" in data
        assert "passages" in data
        assert isinstance(data["stories"], list)
        assert isinstance(data["passages"], list)

        # empty stories & passages since the user is new
        assert len(data["stories"]) == 0
        assert len(data["passages"]) == 0

    @pytest.mark.asyncio
    async def test_view_user_content_with_stories_and_passages(
        self, client: AsyncClient, login_user, login_admin_user
    ):
        """Test viewing content for a user who has created stories and passages (admin access)."""

        user_id = login_user["user"]["id"]
        user_auth = login_user["headers"]
        admin_headers = login_admin_user["headers"]

        story_payload = {
            "title": "Test Story",
            "description": "A test story",
            "first_passage_content": "This is the beginning of the story.",
        }
        story_response = await client.post(
            "/stories/", json=story_payload, headers=user_auth
        )
        assert story_response.status_code == 201
        story_data = story_response.json()

        tree_response = await client.get(f"/stories/{story_data['id']}/tree")
        assert tree_response.status_code == 200
        root_passage_id = tree_response.json()[0]["id"]

        passage_payload = {
            "content": "This is a continuation of the story.",
            "parent_passage_id": root_passage_id,
        }
        passage_response = await client.post(
            f"/stories/{story_data['id']}/passages",
            json=passage_payload,
            headers=user_auth,
        )
        assert passage_response.status_code == 201

        # View the user's content as admin
        response = await client.get(f"/admin/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()

        assert len(data["stories"]) == 1
        assert len(data["passages"]) == 2

        # verify story structure
        story = data["stories"][0]
        assert "id" in story
        assert "title" in story
        assert "description" in story
        assert story["title"] == "Test Story"

        # verify passage structure
        for passage in data["passages"]:
            assert "id" in passage
            assert "content" in passage
            assert "story_id" in passage
