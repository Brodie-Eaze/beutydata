"""Australian Business Register (ABR) lookup.

Uses the public ABR JSON API. Requires an ABR_GUID. If no GUID is configured,
falls back to a checksum-only validation so dev environments still work.
"""
import re

import httpx

from .config import settings

ABR_URL = "https://abr.business.gov.au/json/AbnDetails.aspx"


def _checksum_valid(abn: str) -> bool:
    digits = re.sub(r"\D", "", abn or "")
    if len(digits) != 11:
        return False
    weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    nums = [int(c) for c in digits]
    nums[0] -= 1
    total = sum(n * w for n, w in zip(nums, weights))
    return total % 89 == 0


async def verify_abn(abn: str) -> dict:
    """Return {valid, entity_name, status, raw}."""
    digits = re.sub(r"\D", "", abn or "")
    if not _checksum_valid(digits):
        return {"valid": False, "entity_name": None, "status": "invalid_checksum", "raw": None}

    if not settings.ABR_GUID:
        # dev mode: trust checksum only
        return {"valid": True, "entity_name": None, "status": "unverified_dev", "raw": None}

    params = {"abn": digits, "callback": "", "guid": settings.ABR_GUID}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(ABR_URL, params=params)
        text = r.text.strip()
        # ABR returns JSONP-style: callback({...}). Strip wrapper if present.
        if text.startswith("callback("):
            text = text[len("callback("):-1]
        import json
        data = json.loads(text)
        entity = data.get("EntityName") or data.get("BusinessName", [None])[0]
        abn_status = data.get("AbnStatus", "unknown")
        is_active = abn_status.lower() == "active"
        return {
            "valid": is_active,
            "entity_name": entity,
            "status": abn_status,
            "raw": data,
        }
    except Exception as e:
        return {"valid": False, "entity_name": None, "status": f"lookup_error:{e}", "raw": None}
