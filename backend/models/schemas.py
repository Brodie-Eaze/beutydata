from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- enums ----------
class IncidentType(str, Enum):
    unpaid_invoice = "unpaid_invoice"
    no_show = "no_show"
    late_cancellation = "late_cancellation"
    chargeback = "chargeback"
    repeat_no_show_pattern = "repeat_no_show_pattern"


class IncidentStatus(str, Enum):
    active = "active"
    disputed = "disputed"
    withdrawn = "withdrawn"
    expired = "expired"


class DisputeStatus(str, Enum):
    open = "open"
    upheld = "upheld"
    rejected = "rejected"


class UserRole(str, Enum):
    owner = "owner"
    staff = "staff"


# ---------- auth ----------
class SignupRequest(BaseModel):
    business_name: str
    abn: str
    address: str = ""
    phone: str = ""
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- salon ----------
class SalonOut(BaseModel):
    id: str
    business_name: str
    abn: str
    abn_verified_at: Optional[datetime] = None
    abn_entity_name: Optional[str] = None
    subscription_status: str
    member_agreement_accepted_at: Optional[datetime] = None


# ---------- incident ----------
class IncidentCreate(BaseModel):
    consumer_phone: str = ""
    consumer_email: str = ""
    consumer_first_name: str = ""  # held on incident record only, not on consumer
    incident_type: IncidentType
    incident_date: datetime
    amount_aud: Optional[float] = None
    description: str = Field(max_length=500)
    evidence_keys: list[str] = []
    attestation: bool

    def has_contact(self) -> bool:
        return bool(self.consumer_phone or self.consumer_email)


class IncidentOut(BaseModel):
    id: str
    consumer_id: str
    incident_type: IncidentType
    incident_date: datetime
    amount_aud: Optional[float]
    description: str
    evidence_keys: list[str]
    status: IncidentStatus
    expires_at: datetime
    created_at: datetime
    # only present when current salon owns the incident
    consumer_first_name: Optional[str] = None
    consumer_phone: Optional[str] = None
    consumer_email: Optional[str] = None


# ---------- search ----------
class SearchRequest(BaseModel):
    phone: str = ""
    email: str = ""


class IncidentTypeBreakdown(BaseModel):
    incident_type: IncidentType
    count: int


class OwnIncidentSummary(BaseModel):
    id: str
    incident_type: IncidentType
    incident_date: datetime
    status: IncidentStatus


class SearchResponse(BaseModel):
    matched: bool
    total_active_flags: int
    breakdown: list[IncidentTypeBreakdown]
    own_incidents: list[OwnIncidentSummary]
    other_salons_count: int
    consumer_display: Optional[str] = None  # e.g., "***@gmail.com / ****1234"


# ---------- dispute ----------
class DisputeCreate(BaseModel):
    phone: str = ""
    email: str = ""
    statement: str = Field(max_length=2000)
    evidence_keys: list[str] = []


class PublicIncidentView(BaseModel):
    """De-identified view of an incident, shown on the public dispute portal."""
    id: str
    member_ref: str  # "Member salon #A4F" — never the real name
    incident_type: IncidentType
    incident_date: datetime
    status: IncidentStatus


class DisputeOut(BaseModel):
    id: str
    incident_id: str
    statement: str
    evidence_keys: list[str]
    status: DisputeStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None


class DisputeResolution(BaseModel):
    decision: DisputeStatus  # upheld → incident withdrawn; rejected → incident reinstated
    notes: str = Field(default="", max_length=2000)
