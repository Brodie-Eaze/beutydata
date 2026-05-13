from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB: str = "beauty_network"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRY_DAYS: int = 7
    JWT_ALGORITHM: str = "HS256"

    ABR_GUID: str = ""

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID: str = ""

    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "no-reply@example.com"

    S3_BUCKET: str = ""
    S3_REGION: str = "auto"
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""

    DISPUTE_PORTAL_URL: str = "http://localhost:3000/dispute"
    INCIDENT_TTL_DAYS: int = 365


settings = Settings()
