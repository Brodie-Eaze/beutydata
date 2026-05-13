from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings

_client = None


def get_client():
    global _client
    if _client is None:
        if settings.MONGO_URL.startswith("memory://"):
            from mongomock_motor import AsyncMongoMockClient
            _client = AsyncMongoMockClient()
        else:
            _client = AsyncIOMotorClient(settings.MONGO_URL)
    return _client


def get_db():
    return get_client()[settings.MONGO_DB]


async def init_indexes() -> None:
    db = get_db()
    await db.users.create_index("email", unique=True)
    await db.salons.create_index("abn", unique=True)
    await db.consumers.create_index("phone_hash")
    await db.consumers.create_index("email_hash")
    await db.incidents.create_index("consumer_id")
    await db.incidents.create_index("reporting_salon_id")
    await db.incidents.create_index("status")
    await db.incidents.create_index("expires_at")
    await db.disputes.create_index("incident_id")
    await db.searches.create_index("salon_id")
    await db.consent_notifications.create_index("incident_id")
