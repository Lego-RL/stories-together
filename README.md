# Stories Together

A collaborative storytelling application focused on fostering creativity!

Built with:
- FastAPI/SQLAlchemy/Alembic/Postgres database backend
- React/Vite frontend


### Project Management
To deploy backend changes:
- pull new code
- gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.server:app


To deploy frontend changes:
- npm run build
- sudo systemctl restart nginx