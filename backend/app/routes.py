from fastapi import APIRouter, HTTPException
from typing import Any

from .schemas import Credentials, QueryRequest
from .services import (
    get_client,
    load_credentials,
    read_saved_credentials,
    save_credentials,
)

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


@router.get("/influx/check")
def check_influx() -> dict[str, str]:
    """Ping InfluxDB to verify connectivity with current credentials."""
    creds = load_credentials()
    try:
        with get_client() as client:
            ok = client.ping()
    except HTTPException:
        # Preserve existing HTTP errors (e.g., missing creds)
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Failed to reach InfluxDB "
                f"(url={creds.url}, org={creds.org}, token_prefix={creds.token[:6]}…, token_len={len(creds.token)}): {exc}"
            ),
        )

    if not ok:
        raise HTTPException(
            status_code=503,
            detail=f"InfluxDB ping failed (url={creds.url}, org={creds.org})",
        )

    return {"status": "ok"}


@router.get("/buckets")
def list_buckets() -> list[dict[str, Any]]:
    """Return available buckets from InfluxDB."""
    load_credentials()  # ensure creds exist and are readable
    try:
        with get_client() as client:
            buckets_api = client.buckets_api()
            buckets = buckets_api.find_buckets().buckets or []
            return [
                {"id": b.id, "name": b.name, "description": b.description}
                for b in buckets
            ]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Failed to list buckets: {exc}")
