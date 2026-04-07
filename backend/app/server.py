import uvicorn
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .routes.stories import story_router
from .routes.user_auth import auth_router
from .routes.admin import admin_router
from app.exceptions import StoriesTogetherException

app = FastAPI(
    title="Stories Together API", description="API for Stories Together Applications"
)

allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_root():
    return {"message": "Hello World :)"}


app.include_router(auth_router)
app.include_router(story_router)
app.include_router(admin_router)


@app.exception_handler(StoriesTogetherException)
async def app_exception_handler(request: Request, exc: StoriesTogetherException):
    return JSONResponse(
        status_code=getattr(exc, "status_code", 400),
        content={"error": "AppError", "message": exc.message},
    )


def start_server():
    """
    Launch API server with Uvicorn
    """
    uvicorn.run("app.server:app", host="localhost", port=8000, reload=True)
