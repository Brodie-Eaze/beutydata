import hashlib
import re


def normalize_phone_au(raw: str) -> str:
    """Normalize Australian phone numbers to E.164. Strips non-digits, maps 04xx → +614xx, 0x → +61x."""
    digits = re.sub(r"\D", "", raw or "")
    if not digits:
        return ""
    if digits.startswith("61"):
        return "+" + digits
    if digits.startswith("0"):
        return "+61" + digits[1:]
    return "+" + digits


def normalize_email(raw: str) -> str:
    return (raw or "").strip().lower()


def hash_contact(value: str) -> str:
    if not value:
        return ""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_phone(raw: str) -> str:
    return hash_contact(normalize_phone_au(raw))


def hash_email(raw: str) -> str:
    return hash_contact(normalize_email(raw))


def phone_last4(raw: str) -> str:
    norm = normalize_phone_au(raw)
    return norm[-4:] if len(norm) >= 4 else norm


def email_masked(raw: str) -> str:
    email = normalize_email(raw)
    if "@" not in email:
        return ""
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[:1] + "*"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    return f"{masked_local}@{domain}"
