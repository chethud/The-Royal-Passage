from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class Slot(BaseModel):
    id: str
    date: str
    start: str
    end: str
    capacity: int
    available: int


class CitySummary(BaseModel):
    slug: str
    name: str
    region: str | None = None
    state: str = "Karnataka"
    tagline: str | None = None
    description: str | None = None


class Experience(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    category: str
    city: str
    citySlug: str | None = None
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
    galleryUrls: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)
    region: str | None = None
    cancellation: str
    slots: list[Slot]
    currencySymbol: str | None = "₹"
    minGuestsPerBooking: int = 1
    maxGuestsPerBooking: int = 10


class CatalogResponse(BaseModel):
    mode: Literal["live", "static"]
    experiences: list[Experience]
    categories: list[str]
    cities: list[str]
    citySlugs: list[str] = []


class ExperienceDetailResponse(BaseModel):
    exp: Experience
    source: Literal["live", "static"]


class CreateBookingRequest(BaseModel):
    slotId: str
    guestCount: int = Field(ge=1, le=50)
    notes: str | None = Field(default=None, max_length=500)


class CreateBookingResponse(BaseModel):
    bookingId: str
    totalAmount: int
    currencyCode: str
    bookingStatus: str
    paymentStatus: str
    paymentMethod: str


class BookingSlotSummary(BaseModel):
    id: str
    date: str
    start: str
    end: str


class BookingExperienceSummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    address: str
    image: str
    hostName: str


class BookingSummary(BaseModel):
    id: str
    experience: BookingExperienceSummary
    slot: BookingSlotSummary
    participantCount: int
    totalAmount: int
    currencyCode: str
    currencySymbol: str
    bookingStatus: str
    paymentStatus: str
    paymentMethod: str
    notes: str | None
    createdAt: str
    confirmedAt: str | None = None
    guestName: str | None = None
    guestEmail: str | None = None
    guestPhone: str | None = None


class HostDashboardStats(BaseModel):
    pendingBookings: int
    confirmedBookings: int
    completedBookings: int
    revenueCollectedMinor: int
    revenuePendingMinor: int
    weekRevenueEstimateMinor: int
    upcomingBookings: int
    todayBookings: int
    publishedExperiences: int
    totalBookings: int
    currencySymbol: str = "₹"


class HostRevenueDay(BaseModel):
    date: str
    collectedMinor: int
    pendingMinor: int
    estimatedMinor: int


class HostRevenueSummary(BaseModel):
    collectedMinor: int
    pendingMinor: int
    estimatedMinor: int
    week: list[HostRevenueDay]
    currencySymbol: str = "₹"


class HostReviewSummary(BaseModel):
    id: str
    experienceId: str
    experienceTitle: str
    rating: int
    comment: str | None
    reviewerDisplayName: str | None
    hostReply: str | None = None
    hostRepliedAt: str | None = None
    isVerified: bool = False
    createdAt: str


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


class GuestProfile(BaseModel):
    id: str
    email: str | None
    fullName: str | None
    phone: str | None
    role: str
    createdAt: str


class UpdateGuestProfileRequest(BaseModel):
    fullName: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=30)


class WishlistExperienceSummary(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None
    city: str
    image: str
    pricePerPerson: int
    rating: float
    reviewsCount: int
    currencySymbol: str
    hostName: str


class WishlistItem(BaseModel):
    experienceId: str
    savedAt: str
    experience: WishlistExperienceSummary


class CategoryOption(BaseModel):
    slug: str
    label: str


class HostSlotDetail(BaseModel):
    id: str
    date: str
    start: str
    end: str
    capacity: int
    seatsSold: int
    available: int
    isBlocked: bool


class HostExperienceSummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    pricePerPersonMinor: int
    currencySymbol: str
    slotCount: int
    image: str | None


class HostExperienceDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None
    description: str | None
    categorySlug: str
    categoryLabel: str
    city: str
    citySlug: str | None = None
    region: str | None
    address: str | None
    durationMinutes: int
    pricePerPersonMinor: int
    status: str
    heroImageUrl: str | None
    galleryUrls: list[str] = Field(default_factory=list)
    inclusions: list[str]
    exclusions: list[str]
    requirements: list[str]
    cancellationPolicy: str | None
    minGuestsPerBooking: int
    maxGuestsPerBooking: int
    currencyCode: str
    currencySymbol: str
    slots: list[HostSlotDetail]
    createdAt: str
    updatedAt: str


class CreateHostExperienceRequest(BaseModel):
    title: str = Field(min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str = Field(min_length=50, max_length=5000)
    categorySlug: str
    citySlug: str = Field(min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=200)
    durationMinutes: int = Field(ge=30, le=480)
    pricePerPersonMinor: int = Field(ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] = Field(default_factory=list)
    inclusions: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)
    cancellationPolicy: str | None = Field(default=None, max_length=1000)
    minGuestsPerBooking: int = Field(default=1, ge=1, le=50)
    maxGuestsPerBooking: int = Field(default=10, ge=1, le=50)
    submitForReview: bool = False


class UpdateHostExperienceRequest(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, min_length=50, max_length=5000)
    categorySlug: str | None = None
    citySlug: str | None = Field(default=None, min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=200)
    durationMinutes: int | None = Field(default=None, ge=30, le=480)
    pricePerPersonMinor: int | None = Field(default=None, ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] | None = None
    inclusions: list[str] | None = None
    exclusions: list[str] | None = None
    requirements: list[str] | None = None
    cancellationPolicy: str | None = Field(default=None, max_length=1000)
    minGuestsPerBooking: int | None = Field(default=None, ge=1, le=50)
    maxGuestsPerBooking: int | None = Field(default=None, ge=1, le=50)
    submitForReview: bool = False


class CreateHostSlotRequest(BaseModel):
    slotDate: str
    startTime: str
    endTime: str
    capacity: int = Field(ge=1, le=100)


class UpdateHostSlotRequest(BaseModel):
    slotDate: str | None = None
    startTime: str | None = None
    endTime: str | None = None
    capacity: int | None = Field(default=None, ge=1, le=100)
    isBlocked: bool | None = None


class AdminExperienceSummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    hostName: str
    createdAt: str


class AdminExperienceDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None
    description: str | None
    categorySlug: str
    categoryLabel: str
    city: str
    citySlug: str | None = None
    region: str | None
    address: str | None
    durationMinutes: int
    pricePerPersonMinor: int
    status: str
    heroImageUrl: str | None
    galleryUrls: list[str] = Field(default_factory=list)
    inclusions: list[str]
    exclusions: list[str]
    requirements: list[str]
    cancellationPolicy: str | None
    minGuestsPerBooking: int
    maxGuestsPerBooking: int
    currencyCode: str
    currencySymbol: str
    slots: list[HostSlotDetail]
    createdAt: str
    updatedAt: str
    hostName: str
    hostEmail: str | None = None
    hostPhone: str | None = None
    hostBio: str | None = None
    hostVerified: bool = False


class ReviewSummary(BaseModel):
    id: str
    experienceId: str
    bookingId: str | None = None
    rating: int
    comment: str | None
    reviewerDisplayName: str | None
    hostReply: str | None = None
    hostRepliedAt: str | None = None
    isVerified: bool = False
    status: str = "published"
    createdAt: str


class CreateReviewRequest(BaseModel):
    bookingId: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class HostReplyRequest(BaseModel):
    reply: str = Field(min_length=1, max_length=2000)


class NotificationSummary(BaseModel):
    id: str
    type: str
    title: str
    body: str
    metadata: dict
    readAt: str | None = None
    createdAt: str


class AuditLogEntry(BaseModel):
    id: str
    action: str
    entityType: str
    entityId: str | None = None
    actorName: str | None = None
    metadata: dict
    createdAt: str


class AdminStats(BaseModel):
    totalGuests: int
    totalHosts: int
    publishedExperiences: int
    totalBookings: int
    revenueCollectedMinor: int
    pendingExperienceReviews: int
    currencySymbol: str = "₹"
    confirmedBookings: int = 0
    pendingBookings: int = 0
    completedBookings: int = 0
    cancelledBookings: int = 0
    grossBookingValueMinor: int = 0
    platformRevenueMinor: int = 0
    hostPayoutDueMinor: int = 0
    codPendingCollectionMinor: int = 0
    commissionPercent: float = 10.0


class AdminBookingRow(BaseModel):
    id: str
    guestName: str | None
    guestEmail: str | None
    experienceTitle: str
    bookingStatus: str
    paymentStatus: str
    totalAmount: int
    currencySymbol: str
    createdAt: str
    slotDate: str
    platformFeeMinor: int = 0
    hostPayoutMinor: int = 0
    hostName: str | None = None
