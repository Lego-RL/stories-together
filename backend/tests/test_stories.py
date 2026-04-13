import pytest
from app.db.models import Passage, User
from app.db.session import SessionLocal
from app.repositories.passage import (
    create_passage,
    delete_passage_by_id,
    get_story_tree,
)
from app.repositories.story import (
    create_story_with_first_passage,
    delete_story_by_id,
    get_one_story,
)
from httpx import AsyncClient
from sqlalchemy import select

SEARCH_TEST_DATA = [
    # (query, expected_count, fragment_of_title_expected)
    ("Dragon", 1, "The Dragon's Echo"),
    ("Echo", 2, "Echoes"),  # should find "The Dragon's Echo" and "Echoes of the Past"
    ("the", 3, "The"),  # case-insensitive "the" matches 3 titles
    ("Zebra", 0, None),  # no matches
    ("Dr", 0, None),  # below 3-character threshold
]


class TestStories:
    @pytest.mark.asyncio
    async def test_create_story_authenticated(self, client: AsyncClient):
        """Test that a logged-in user can successfully create a story."""

        # create user
        user_creds = {
            "username": "bard",
            "email": "bard@test.com",
            "password": "secret_password",
        }
        await client.post("/auth/register", json=user_creds)

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
        assert data["first_passage_content"] == story_payload["first_passage_content"]
        assert data["passage_count"] == 1

    @pytest.mark.asyncio
    async def test_create_story_unauthorized(self, client: AsyncClient):
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
    async def test_add_passage_to_story(self, client, login_user):
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

    @pytest.mark.asyncio
    async def test_get_linear_path(self, client, login_user):
        auth = login_user["headers"]

        # sample story
        story_res = await client.post(
            "/stories/",
            json={"title": "Path Test", "first_passage_content": "Level 1"},
            headers=auth,
        )
        story_id = story_res.json()["id"]

        # get initial passage id
        tree = await client.get(f"/stories/{story_id}/tree")
        root_id = tree.json()[0]["id"]

        # make child passage
        child_res = await client.post(
            f"/stories/{story_id}/passages",
            json={"content": "Level 2", "parent_passage_id": root_id},
            headers=auth,
        )
        child_id = child_res.json()["id"]

        # make grandchild passage
        grandchild_res = await client.post(
            f"/stories/{story_id}/passages",
            json={"content": "Level 3", "parent_passage_id": child_id},
            headers=auth,
        )
        grandchild_id = grandchild_res.json()["id"]

        # find path for grandchild
        path_res = await client.get(f"/stories/passages/{grandchild_id}/path")

        assert path_res.status_code == 200
        path_data = path_res.json()
        assert len(path_data) == 3
        assert path_data[0]["content"] == "Level 1"
        assert path_data[1]["content"] == "Level 2"
        assert path_data[2]["content"] == "Level 3"

    @pytest.mark.asyncio
    async def test_list_story_includes_first_passage_and_count(
        self, client, login_user
    ):
        auth = login_user["headers"]

        story_res = await client.post(
            "/stories/",
            json={
                "title": "Payload Check Story",
                "description": "Testing list payload fields",
                "first_passage_content": "Initial branch starts here",
            },
            headers=auth,
        )
        story_id = story_res.json()["id"]

        tree_res = await client.get(f"/stories/{story_id}/tree")
        root_passage_id = tree_res.json()[0]["id"]

        await client.post(
            f"/stories/{story_id}/passages",
            json={"content": "Second passage", "parent_passage_id": root_passage_id},
            headers=auth,
        )

        list_res = await client.get("/stories/", params={"skip": 0, "limit": 20})
        assert list_res.status_code == 200

        stories = list_res.json()
        payload_story = next(
            (story for story in stories if story["id"] == story_id), None
        )
        assert payload_story is not None
        assert payload_story["description"] == "Testing list payload fields"
        assert payload_story["first_passage_content"] == "Initial branch starts here"
        assert payload_story["passage_count"] == 2


class TestStorySearch:
    @pytest.mark.asyncio
    @pytest.mark.parametrize("query, expected_count, title_fragment", SEARCH_TEST_DATA)
    async def test_story_search_logic(
        self,
        client: AsyncClient,
        populate_stories,
        query,
        expected_count,
        title_fragment,
    ):

        # perform search
        response = await client.get("/stories/search", params={"q": query})

        assert response.status_code == 200
        results = response.json()
        print(results)

        assert len(results) == expected_count

        if expected_count > 0:
            # see if expected fragment is present in at least one of the titles
            titles = [s["title"] for s in results]
            assert any(title_fragment.lower() in t.lower() for t in titles)

            first_result = results[0]
            assert "first_passage_content" in first_result
            assert "passage_count" in first_result
            assert isinstance(first_result["passage_count"], int)


class TestDeleteFunctions:
    @pytest.mark.asyncio
    async def test_delete_story_by_id(self):
        async with SessionLocal() as db:
            user = User(
                username="testuser",
                email="test@example.com",
                hashed_password="pass",
                active=True,
                role="user",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            story = await create_story_with_first_passage(
                "Test Story",
                "DescriptionDescriptionDescriptionDescription",
                "ContentContentContentContentContentContent",
                user.id,
            )

            deleted = await delete_story_by_id(story.id)
            # ensure exactly one story was deleted
            assert deleted == 1

            # ensure story is truly, definitively gone
            assert await get_one_story(story.id) is None

    @pytest.mark.asyncio
    async def test_delete_passage_by_id(self):
        async with SessionLocal() as db:
            user = User(
                username="testuser2",
                email="test2@example.com",
                hashed_password="pass",
                active=True,
                role="user",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            story = await create_story_with_first_passage(
                "Test Story2",
                "DescriptionDescriptionDescriptionDescription",
                "ContentContentContentContentContentContentContent",
                user.id,
            )

            # get the story's first passage
            tree = await get_story_tree(story.id)
            first_passage = tree[0]

            # make another passage
            passage = await create_passage(
                story.id, "New content", first_passage.id, user.id
            )

            # delete new passage
            deleted = await delete_passage_by_id(passage.id)
            assert deleted == 1

            # ensure new passage is gone
            result = await db.execute(select(Passage).where(Passage.id == passage.id))
            assert result.scalar_one_or_none() is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent_story(self):
        deleted = await delete_story_by_id(99999)  # id shouldn't exist
        assert deleted == 0

    @pytest.mark.asyncio
    async def test_delete_nonexistent_passage(self):
        deleted = await delete_passage_by_id(99999)
        assert deleted == 0
