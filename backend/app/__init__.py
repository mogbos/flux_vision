from fastapi import FastAPI

from .routes import router

app = FastAPI(title="FluxVision Backend API")
app.include_router(router)

__all__ = ["app"]
