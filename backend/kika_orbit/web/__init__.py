from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

WEB_DIR = Path(__file__).resolve().parent
STATIC_DIR = WEB_DIR / "static"

router = APIRouter(tags=["web"])


@router.get("/", include_in_schema=False)
@router.get("/login", include_in_schema=False)
@router.get("/app", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")
