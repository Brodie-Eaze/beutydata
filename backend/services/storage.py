"""S3 / R2 evidence upload via presigned URLs.

Returns presigned PUT URLs for upload and presigned GET URLs for retrieval.
Falls back to a stub when S3 is not configured.
"""
import logging
import uuid
from typing import Optional

from core.config import settings

log = logging.getLogger("storage")


def _client():
    if not settings.S3_BUCKET:
        return None
    import boto3  # type: ignore
    kwargs = {
        "region_name": settings.S3_REGION,
        "aws_access_key_id": settings.S3_ACCESS_KEY,
        "aws_secret_access_key": settings.S3_SECRET_KEY,
    }
    if settings.S3_ENDPOINT:
        kwargs["endpoint_url"] = settings.S3_ENDPOINT
    return boto3.client("s3", **kwargs)


def new_evidence_key(salon_id: str, filename: str) -> str:
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()
        if len(ext) > 8:
            ext = ""
    return f"evidence/{salon_id}/{uuid.uuid4().hex}{ext}"


def presigned_put(key: str, content_type: str = "application/octet-stream") -> Optional[str]:
    c = _client()
    if not c:
        log.warning("[storage stub] presigned_put key=%s", key)
        return f"https://stub.local/upload/{key}"
    return c.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": key, "ContentType": content_type},
        ExpiresIn=600,
    )


def presigned_get(key: str) -> Optional[str]:
    c = _client()
    if not c:
        return f"https://stub.local/get/{key}"
    return c.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": key},
        ExpiresIn=600,
    )
