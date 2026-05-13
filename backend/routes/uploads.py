from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.auth import get_current_salon
from services.storage import new_evidence_key, presigned_put

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


class PresignRequest(BaseModel):
    filename: str
    content_type: str = "application/octet-stream"


class PresignResponse(BaseModel):
    key: str
    url: str


@router.post("/presign", response_model=PresignResponse)
async def presign(req: PresignRequest, salon: dict = Depends(get_current_salon)):
    key = new_evidence_key(salon["_id"], req.filename)
    url = presigned_put(key, req.content_type)
    return PresignResponse(key=key, url=url)
