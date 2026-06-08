from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class Slot(BaseModel):
    id: str
    date: str
    start: str
    end: str
    capacity: int
    available: int


class Experience(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    category: str
    city: str
    address: str
    durationHours: float
    hostName: str
    hostBio: str
    verifiedHost: bool
    pricePerPerson: int
    rating: float
    reviewsCount: int
    image: str
    inclusions: list[str]
    cancellation: str
    slots: list[Slot]
    currencySymbol: str | None = "₹"


class CatalogResponse(BaseModel):
    mode: Literal["live", "static"]
    experiences: list[Experience]
    categories: list[str]
    cities: list[str]


class ExperienceDetailResponse(BaseModel):
    exp: Experience
    source: Literal["live", "static"]


class CreateBookingRequest(BaseModel):
    slotId: str
    guestCount: int = Field(ge=1, le=50)
    guestName: str = Field(min_length=1, max_length=200)
    guestEmail: EmailStr
    guestPhone: str | None = Field(default=None, max_length=30)


class CreateBookingResponse(BaseModel):
    bookingId: str
    subtotalMinor: int
    status: str


class ManagedUser(BaseModel):
    id: str
    email: str | None
    fullName: str | None
    phone: str | None
    role: str
    hostId: str | None
    createdAt: str


class CreateHostRequest(BaseModel):
    displayName: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    phone: str | None = Field(default=None, max_length=30)
    bio: str | None = Field(default=None, max_length=500)


class CreateHostResponse(BaseModel):
    id: str
    email: str
    displayName: str
    hostId: str
