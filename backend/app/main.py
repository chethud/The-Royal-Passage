from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.routers import admin, bookings, catalog, cities, guest, health, host, notifications, reviews

app = FastAPI(
    title="The Royal Passage API",
    description="FastAPI backend for marketplace, bookings, and admin operations.",
    version="1.0.0",
    docs_url="/docs" if settings.enable_api_docs else None,
    redoc_url="/redoc" if settings.enable_api_docs else None,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_per_minute)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(cities.router)
app.include_router(catalog.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(host.router)
app.include_router(guest.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
