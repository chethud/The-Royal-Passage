# The Royal Passage — FastAPI Backend

Python API for catalog, bookings, and admin operations. Uses Supabase (PostgreSQL + Auth) as the database.

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://sqecqtcmgbfrwwgnbdsx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGINS=http://localhost:5173,http://localhost:8080,http://localhost:8081
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/api/v1/catalog` | — | Published experiences |
| GET | `/api/v1/experiences/{slug}` | — | Experience detail |
| POST | `/api/v1/bookings` | — | Create pending booking |
| GET | `/api/v1/admin/users` | Bearer JWT (admin) | List users |
| POST | `/api/v1/admin/hosts` | Bearer JWT (admin) | Create host login |

## Frontend

Set in project root `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Auth stays in the browser via Supabase. Admin routes pass `Authorization: Bearer <access_token>`.
