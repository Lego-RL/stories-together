import uvicorn
from fastapi import FastAPI

from .routes.user_auth import auth_router

app = FastAPI(
    title="Stories Together API", description="API for Stories Together Applications"
)


@app.get("/")
def get_root():
    return {"message": "Hello World :)"}


app.include_router(auth_router)


def start_server():
    """
    Launch API server with Uvicorn
    """
    uvicorn.run("app.server:app", host="localhost", port=8000, reload=True)
