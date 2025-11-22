from fastapi import APIRouter, HTTPException
from typing import Any

from .schemas import Credentials, QueryRequest
from .services import get_client, load_credentials, read_saved_credentials, save_credentials

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
    

@router.post("/credentials")
def save_credentials_route(payload: Credentials) -> dict[str, str]:
    save_credentials(payload)
    return {"status": "saved"}


@router.get("/credentials")
def fetch_credentials() -> Credentials:
    creds = read_saved_credentials()
    if not creds:
        raise HTTPException(status_code=404, detail="No credentials saved")
    return creds
