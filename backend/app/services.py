import json
from pathlib import Path
from typing import Optional

from fastapi import HTTPException
from influxdb_client import InfluxDBClient

from .config import CREDENTIALS_FILE
from .schemas import Credentials


def load_credentials() -> Credentials:
    """Load credentials from env vars first, otherwise from saved JSON."""

    if CREDENTIALS_FILE.exists():
        try:
            data = json.loads(CREDENTIALS_FILE.read_text())
            return Credentials(**data)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to read credentials: {exc}")

    raise HTTPException(status_code=400, detail="InfluxDB credentials not configured yet")


def read_saved_credentials() -> Optional[Credentials]:
    """Return credentials from saved JSON if it exists, otherwise None."""
    if not CREDENTIALS_FILE.exists():
        return None
    try:
        data = json.loads(CREDENTIALS_FILE.read_text())
        return Credentials(**data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to read credentials: {exc}")


def save_credentials(payload: Credentials) -> None:
    """Persist credentials to JSON."""
    try:
        Path(CREDENTIALS_FILE).parent.mkdir(parents=True, exist_ok=True)
        CREDENTIALS_FILE.write_text(payload.model_dump_json(indent=2))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save credentials: {exc}")


def get_client() -> InfluxDBClient:
    """Create a new InfluxDB client instance using env vars or saved credentials file."""
    creds = load_credentials()
    return InfluxDBClient(url=creds.url, token=creds.token, org=creds.org)
