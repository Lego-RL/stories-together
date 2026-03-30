# Stories Together API

- Run `uv run python -m app` from `backend` directory to initialize API
- Run `uv run python -m pytest` from `backend` directory to run pytest tests

## Project Structure
- `db` handles database schema definitions & the session factory
- `routes` handles the FastAPI endpoints
- `services` handles business logic
- `repositories` handles database queries / access functionality