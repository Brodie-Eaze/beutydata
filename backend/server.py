import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.db import init_indexes
from routes import (auth, billing, disputes, incidents, public, salons,
                    search, uploads)
from services.expiry import run_daily

logging.basicConfig(level=logging.INFO)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_indexes()
    scheduler.add_job(run_daily, "cron", hour=3, minute=0, id="daily_expiry")
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="Beauty Client Warning Network API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(salons.router)
app.include_router(incidents.router)
app.include_router(search.router)
app.include_router(disputes.router)
app.include_router(public.router)
app.include_router(billing.router)
app.include_router(uploads.router)


@app.get("/api/health")
async def health():
    return {"ok": True}
