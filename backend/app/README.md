# Stories Together API

- Run `uv run python -m app` from `backend` directory to initialize API
- Run `uv run python -m pytest` from `backend` directory to run pytest tests

## Project Structure
- `db` handles database schema definitions & the session factory
- `routes` handles the FastAPI endpoints
- `services` handles business logic
- `repositories` handles database queries / access functionality


## Managing Alembic & Database version
- `alembic current` to see current alembic database version
- `alembic upgrade head` to upgrade to newest version
- `alembic (up/down)grade (+/-)2` for relative upgrade/downgrades