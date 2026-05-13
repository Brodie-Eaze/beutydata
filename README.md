# Beauty Client Warning Network (working name)

A private, paid, members-only incident-sharing network for Australian beauty businesses.

**Not a credit register. Not a blacklist. An incident-sharing network.**

## Structure

```
backend/   FastAPI + MongoDB + JWT
frontend/  React 19 + Tailwind + shadcn/ui
docs/      Legal scaffolding (privacy policy, member agreement, consent clause)
```

## Quickstart

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in MONGO_URL, JWT_SECRET, etc.
uvicorn server:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # set REACT_APP_API_URL
npm start
```

## Status

MVP scaffold. See plan in repo history. Step 1 complete: auth, salon signup, ABN check stub, incident CRUD, hashed search, dispute portal, expiry cron.

## Legal

This product handles personal information about identifiable individuals under the Australian Privacy Act 1988. Do **not** deploy to production without a privacy/defamation lawyer review. See `docs/`.
