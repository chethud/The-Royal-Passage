from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


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
    mapLink: str | None = None
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


class HomestayRoom(BaseModel):
    id: str
    name: str
    category: str | None = None
    capacity: int
    pricePerNight: int
    weekendPricePerNight: int | None = None
    totalUnits: int = 1
    amenities: list[str] = Field(default_factory=list)
    extraBedAvailable: bool = False
    extraBedPricePerNight: int = 0
    extraBedWeekendPricePerNight: int = 0
    extraBedsPerRoom: int = 1


class HomestayDatePrice(BaseModel):
    date: str
    pricePerNight: int
    label: str | None = None
    extraBedPricePerNight: int | None = None


class Homestay(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    propertyType: str
    city: str
    citySlug: str | None = None
    address: str
    region: str | None = None
    mapLink: str | None = None
    pricePerNight: int
    weekendPricePerNight: int | None = None
    rating: float
    reviewsCount: int
    image: str
    galleryUrls: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    houseRules: list[str] = Field(default_factory=list)
    bedrooms: int = 1
    bathrooms: int = 1
    maxGuests: int = 2
    checkInTime: str = "14:00"
    checkOutTime: str = "11:00"
    currencySymbol: str | None = "₹"
    ownerName: str = "Host"
    rooms: list[HomestayRoom] = Field(default_factory=list)
    extraBedAvailable: bool = False
    extraBedPricePerNight: int = 0
    extraBedWeekendPricePerNight: int = 0
    extraBedsPerRoom: int = 1
    datePrices: list[HomestayDatePrice] = Field(default_factory=list)


class ListHomestaysResponse(BaseModel):
    mode: Literal["live", "static"]
    homestays: list[Homestay]
    propertyTypes: list[str]
    cities: list[str]


class HomestayDetailResponse(BaseModel):
    homestay: Homestay
    source: Literal["live", "static"]


class CreateHomestayOwnerRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=32)
    address: str | None = Field(default=None, max_length=500)


class CreateHomestayOwnerResponse(BaseModel):
    id: str
    email: EmailStr
    fullName: str
    homestayOwnerId: str


class CreateHomestayBookingRequest(BaseModel):
    homestayId: str
    roomId: str | None = None
    checkIn: str
    checkOut: str
    guestCount: int = Field(ge=1, le=50)
    notes: str | None = Field(default=None, max_length=500)
    roomCount: int = Field(default=1, ge=1, le=20)
    extraBedCount: int = Field(default=0, ge=0, le=20)


class CreateHomestayBookingResponse(BaseModel):
    bookingId: str
    totalAmount: int
    currencyCode: str
    bookingStatus: str
    paymentStatus: str
    nights: int


class OwnerHomestayAvailability(BaseModel):
    id: str
    date: str
    roomId: str | None = None
    isBlocked: bool = False
    priceOverrideMinor: int | None = None
    minNights: int | None = None
    note: str | None = None
    extraBedPriceOverrideMinor: int | None = None


class OwnerHomestayRoom(BaseModel):
    id: str
    name: str
    category: str | None = None
    capacity: int
    pricePerNightMinor: int
    weekendPricePerNightMinor: int | None = None
    totalUnits: int = 1
    amenities: list[str] = Field(default_factory=list)
    sortOrder: int = 0
    isActive: bool = True
    extraBedAvailable: bool = False
    extraBedPricePerNightMinor: int = 0
    extraBedWeekendPricePerNightMinor: int = 0
    extraBedsPerRoom: int = 1


class OwnerHomestaySummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    pricePerNightMinor: int
    currencySymbol: str
    roomCount: int
    image: str | None = None


class OwnerHomestayDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None = None
    description: str | None = None
    propertyType: str
    city: str
    citySlug: str | None = None
    region: str | None = None
    address: str | None = None
    mapLink: str | None = None
    pricePerNightMinor: int
    weekendPricePerNightMinor: int | None = None
    status: str
    heroImageUrl: str | None = None
    galleryUrls: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    houseRules: list[str] = Field(default_factory=list)
    bedrooms: int = 1
    bathrooms: int = 1
    maxGuests: int = 2
    checkInTime: str = "14:00"
    checkOutTime: str = "11:00"
    currencyCode: str = "INR"
    currencySymbol: str = "₹"
    rooms: list[OwnerHomestayRoom] = Field(default_factory=list)
    availability: list[OwnerHomestayAvailability] = Field(default_factory=list)
    createdAt: str
    updatedAt: str
    extraBedAvailable: bool = False
    extraBedPricePerNightMinor: int = 0
    extraBedWeekendPricePerNightMinor: int = 0
    extraBedsPerRoom: int = 1
    licenseCertificateUrl: str | None = None


class CreateOwnerHomestayRequest(BaseModel):
    title: str = Field(min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str = Field(min_length=50, max_length=5000)
    propertyType: str
    citySlug: str = Field(min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=200)
    mapLink: str | None = Field(default=None, max_length=500)
    pricePerNightMinor: int = Field(ge=0)
    weekendPricePerNightMinor: int | None = Field(default=None, ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    houseRules: list[str] = Field(default_factory=list)
    bedrooms: int = Field(default=1, ge=1, le=20)
    bathrooms: int = Field(default=1, ge=1, le=20)
    maxGuests: int = Field(default=2, ge=1, le=50)
    checkInTime: str | None = Field(default=None, max_length=8)
    checkOutTime: str | None = Field(default=None, max_length=8)
    submitForReview: bool = False
    extraBedAvailable: bool = False
    extraBedPricePerNightMinor: int = Field(default=0, ge=0)
    extraBedWeekendPricePerNightMinor: int = Field(default=0, ge=0)
    extraBedsPerRoom: int = Field(default=1, ge=1, le=2)
    licenseCertificateUrl: str = Field(min_length=10, max_length=2048)


class UpdateOwnerHomestayRequest(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, min_length=50, max_length=5000)
    propertyType: str | None = None
    citySlug: str | None = Field(default=None, min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=200)
    mapLink: str | None = Field(default=None, max_length=500)
    pricePerNightMinor: int | None = Field(default=None, ge=0)
    weekendPricePerNightMinor: int | None = Field(default=None, ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] | None = None
    amenities: list[str] | None = None
    houseRules: list[str] | None = None
    bedrooms: int | None = Field(default=None, ge=1, le=20)
    bathrooms: int | None = Field(default=None, ge=1, le=20)
    maxGuests: int | None = Field(default=None, ge=1, le=50)
    checkInTime: str | None = Field(default=None, max_length=8)
    checkOutTime: str | None = Field(default=None, max_length=8)
    submitForReview: bool = False
    extraBedAvailable: bool | None = None
    extraBedPricePerNightMinor: int | None = Field(default=None, ge=0)
    extraBedWeekendPricePerNightMinor: int | None = Field(default=None, ge=0)
    extraBedsPerRoom: int | None = Field(default=None, ge=1, le=2)
    licenseCertificateUrl: str | None = Field(default=None, min_length=10, max_length=2048)


class CreateOwnerHomestayRoomRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    category: str | None = Field(default=None, max_length=40)
    capacity: int = Field(ge=1, le=20)
    pricePerNightMinor: int = Field(ge=0)
    weekendPricePerNightMinor: int | None = Field(default=None, ge=0)
    totalUnits: int = Field(default=1, ge=1, le=20)
    amenities: list[str] = Field(default_factory=list)
    sortOrder: int = 0
    extraBedAvailable: bool = False
    extraBedPricePerNightMinor: int = Field(default=0, ge=0)
    extraBedWeekendPricePerNightMinor: int = Field(default=0, ge=0)
    extraBedsPerRoom: int = Field(default=1, ge=1, le=2)


class UpdateOwnerHomestayRoomRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    category: str | None = Field(default=None, max_length=40)
    capacity: int | None = Field(default=None, ge=1, le=20)
    pricePerNightMinor: int | None = Field(default=None, ge=0)
    weekendPricePerNightMinor: int | None = Field(default=None, ge=0)
    totalUnits: int | None = Field(default=None, ge=1, le=20)
    amenities: list[str] | None = None
    sortOrder: int | None = None
    isActive: bool | None = None
    extraBedAvailable: bool | None = None
    extraBedPricePerNightMinor: int | None = Field(default=None, ge=0)
    extraBedWeekendPricePerNightMinor: int | None = Field(default=None, ge=0)
    extraBedsPerRoom: int | None = Field(default=None, ge=1, le=2)


class OwnerVipPackageSummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    priceFromMinor: int
    currencySymbol: str
    durationDays: int
    image: str | None = None
    packageType: str


class OwnerVipPackageDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None = None
    description: str | None = None
    packageType: str
    city: str
    citySlug: str | None = None
    region: str | None = None
    priceFromMinor: int
    status: str
    heroImageUrl: str | None = None
    galleryUrls: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    conciergeNote: str | None = None
    durationDays: int = 1
    maxGuests: int = 2
    currencyCode: str = "INR"
    currencySymbol: str = "₹"
    createdAt: str
    updatedAt: str


class CreateOwnerVipPackageRequest(BaseModel):
    title: str = Field(min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str = Field(min_length=50, max_length=5000)
    packageType: str
    citySlug: str = Field(min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    priceFromMinor: int = Field(ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    conciergeNote: str | None = Field(default=None, max_length=1000)
    durationDays: int = Field(default=1, ge=1, le=30)
    maxGuests: int = Field(default=2, ge=1, le=50)
    submitForReview: bool = False


class UpdateOwnerVipPackageRequest(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, min_length=50, max_length=5000)
    packageType: str | None = None
    citySlug: str | None = Field(default=None, min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    priceFromMinor: int | None = Field(default=None, ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] | None = None
    highlights: list[str] | None = None
    conciergeNote: str | None = Field(default=None, max_length=1000)
    durationDays: int | None = Field(default=None, ge=1, le=30)
    maxGuests: int | None = Field(default=None, ge=1, le=50)
    submitForReview: bool = False


class OwnerVipPackageSummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    priceFromMinor: int
    currencySymbol: str
    durationDays: int
    image: str | None = None
    packageType: str


class OwnerVipPackageDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None = None
    description: str | None = None
    packageType: str
    city: str
    citySlug: str | None = None
    region: str | None = None
    priceFromMinor: int
    status: str
    heroImageUrl: str | None = None
    galleryUrls: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    conciergeNote: str | None = None
    durationDays: int = 1
    maxGuests: int = 2
    currencyCode: str = "INR"
    currencySymbol: str = "₹"
    createdAt: str
    updatedAt: str


class CreateOwnerVipPackageRequest(BaseModel):
    title: str = Field(min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str = Field(min_length=50, max_length=5000)
    packageType: str
    citySlug: str = Field(min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    priceFromMinor: int = Field(ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    conciergeNote: str | None = Field(default=None, max_length=1000)
    durationDays: int = Field(default=1, ge=1, le=30)
    maxGuests: int = Field(default=2, ge=1, le=50)
    submitForReview: bool = False


class UpdateOwnerVipPackageRequest(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=120)
    slug: str | None = Field(default=None, max_length=120, pattern=r"^[a-z0-9-]+$")
    tagline: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, min_length=50, max_length=5000)
    packageType: str | None = None
    citySlug: str | None = Field(default=None, min_length=2, max_length=64, pattern=r"^[a-z0-9-]+$")
    city: str | None = Field(default=None, min_length=2, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    priceFromMinor: int | None = Field(default=None, ge=0)
    heroImageUrl: str | None = Field(default=None, max_length=500)
    galleryUrls: list[str] | None = None
    highlights: list[str] | None = None
    conciergeNote: str | None = Field(default=None, max_length=1000)
    durationDays: int | None = Field(default=None, ge=1, le=30)
    maxGuests: int | None = Field(default=None, ge=1, le=50)
    submitForReview: bool = False


class UpsertOwnerAvailabilityRequest(BaseModel):
    date: str
    roomId: str | None = None
    isBlocked: bool = False
    priceOverrideMinor: int | None = Field(default=None, ge=0)
    minNights: int | None = Field(default=None, ge=1)
    note: str | None = Field(default=None, max_length=200)
    extraBedPriceOverrideMinor: int | None = Field(default=None, ge=0)


class OwnerDashboardStats(BaseModel):
    pendingBookings: int
    confirmedBookings: int
    completedBookings: int
    revenueCollectedMinor: int
    revenuePendingMinor: int
    upcomingBookings: int
    checkInToday: int
    publishedHomestays: int
    currencySymbol: str = "₹"
    totalBookings: int


class HomestayBookingSummary(BaseModel):
    id: str
    homestayId: str
    homestayTitle: str
    homestaySlug: str
    roomName: str | None = None
    checkIn: str
    checkOut: str
    nights: int
    guestCount: int
    totalAmount: int
    currencyCode: str
    currencySymbol: str
    bookingStatus: str
    paymentStatus: str
    paymentMethod: str
    guestName: str | None = None
    notes: str | None = None
    createdAt: str
    checkInTime: str | None = None
    checkOutTime: str | None = None
    homestayAddress: str | None = None
    roomCount: int = 1
    extraBedCount: int = 0
    rejectionReason: str | None = None
    homestayImageUrl: str | None = None
    decisionByName: str | None = None
    decisionByPhone: str | None = None


class ListHomestayBookingsResponse(BaseModel):
    bookings: list[HomestayBookingSummary]


class AdminHomestaySummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    ownerName: str
    createdAt: str


class AdminHomestayDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None = None
    description: str | None = None
    propertyType: str
    city: str
    citySlug: str | None = None
    region: str | None = None
    address: str | None = None
    mapLink: str | None = None
    pricePerNightMinor: int
    weekendPricePerNightMinor: int | None = None
    status: str
    heroImageUrl: str | None = None
    galleryUrls: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    houseRules: list[str] = Field(default_factory=list)
    bedrooms: int = 1
    bathrooms: int = 1
    maxGuests: int = 2
    checkInTime: str = "14:00"
    checkOutTime: str = "11:00"
    currencyCode: str = "INR"
    currencySymbol: str = "₹"
    rooms: list[OwnerHomestayRoom] = Field(default_factory=list)
    createdAt: str
    updatedAt: str
    extraBedAvailable: bool = False
    extraBedPricePerNightMinor: int = 0
    extraBedWeekendPricePerNightMinor: int = 0
    extraBedsPerRoom: int = 1
    ownerName: str
    ownerEmail: str | None = None
    ownerPhone: str | None = None
    ownerVerified: bool = False
    licenseCertificateUrl: str | None = None


class ListAdminHomestaysResponse(BaseModel):
    homestays: list[AdminHomestaySummary]


class CreateVipOwnerRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: str
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=500)


class CreateVipOwnerResponse(BaseModel):
    id: str
    email: str
    fullName: str
    vipOwnerId: str


class AdminVipPackageSummary(BaseModel):
    id: str
    slug: str
    title: str
    city: str
    status: str
    ownerName: str
    createdAt: str
    packageType: str


class AdminVipPackageDetail(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str | None = None
    description: str | None = None
    packageType: str
    city: str
    citySlug: str | None = None
    region: str | None = None
    priceFromMinor: int
    status: str
    heroImageUrl: str | None = None
    galleryUrls: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    conciergeNote: str | None = None
    durationDays: int = 1
    maxGuests: int = 2
    currencyCode: str = "INR"
    currencySymbol: str = "₹"
    createdAt: str
    updatedAt: str
    ownerName: str
    ownerEmail: str | None = None
    ownerPhone: str | None = None
    ownerVerified: bool = False


class ListAdminVipPackagesResponse(BaseModel):
    packages: list[AdminVipPackageSummary]


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
    isPaused: bool = False
    pausedAt: str | None = None
    decisionByName: str | None = None
    decisionByPhone: str | None = None
    rejectionReason: str | None = None


class HostBookingDecisionRequest(BaseModel):
    decisionName: str = Field(min_length=2, max_length=120)
    decisionPhone: str = Field(min_length=10, max_length=16)
    rejectionReason: str | None = Field(default=None, max_length=500)


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
    period: str = "month"
    grain: str = "day"
    previousCollectedMinor: int = 0
    previousPendingMinor: int = 0
    previousEstimatedMinor: int = 0


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
    roles: list[str] = Field(default_factory=list)
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


class CreatePlatformUserRequest(BaseModel):
    role: Literal["host", "homestay_owner", "vip_owner", "admin", "editor"] | None = None
    roles: list[Literal["host", "homestay_owner", "vip_owner", "admin", "editor"]] | None = None
    fullName: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=32)
    bio: str | None = Field(default=None, max_length=500)
    address: str | None = Field(default=None, max_length=500)


class CreatePlatformUserResponse(BaseModel):
    id: str
    email: str
    fullName: str
    role: str
    roles: list[str] = Field(default_factory=list)
    hostId: str | None = None
    homestayOwnerId: str | None = None
    vipOwnerId: str | None = None


class GuestProfile(BaseModel):
    id: str
    email: str | None
    fullName: str | None
    phone: str | None
    role: str
    createdAt: str
    avatarUrl: str | None = None
    dateOfBirth: str | None = None
    vipMembershipStatus: str = "none"
    vipMembershipRejectedAt: str | None = None


class SubmitVipMembershipApplicationRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: str
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=500)
    idDocumentNumber: str = Field(min_length=12, max_length=12, pattern=r"^\d{12}$")
    idDocumentPhotoUrl: str = Field(min_length=10, max_length=2048)
    description: str = Field(min_length=20, max_length=2000)
    professionalCardType: Literal["business", "visitor"]
    professionalCardPhotoUrl: str = Field(min_length=10, max_length=2048)
    instagramUsername: str | None = Field(default=None, max_length=80)
    facebookUsername: str | None = Field(default=None, max_length=80)

    @field_validator("instagramUsername", "facebookUsername")
    @classmethod
    def normalize_social_username(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip().lstrip("@")
        return trimmed or None

    @model_validator(mode="after")
    def require_social_username(self) -> "SubmitVipMembershipApplicationRequest":
        if not self.instagramUsername and not self.facebookUsername:
            raise ValueError("Provide at least one Instagram or Facebook username.")
        return self


class VipMembershipApplicationSummary(BaseModel):
    id: str
    guestUserId: str
    fullName: str
    email: str
    phone: str | None = None
    idDocumentType: str
    status: str
    createdAt: str
    idDocumentPhotoUrl: str | None = None
    description: str | None = None
    professionalCardType: str | None = None
    professionalCardPhotoUrl: str | None = None
    instagramUsername: str | None = None
    facebookUsername: str | None = None


class VipMembershipApplicationDetail(BaseModel):
    id: str
    guestUserId: str
    fullName: str
    email: str
    phone: str | None = None
    address: str | None = None
    idDocumentType: str
    idDocumentNumber: str
    status: str
    createdAt: str
    idDocumentPhotoUrl: str
    description: str
    professionalCardType: str
    professionalCardPhotoUrl: str
    instagramUsername: str | None = None
    facebookUsername: str | None = None


class ListVipMembershipApplicationsResponse(BaseModel):
    applications: list[VipMembershipApplicationSummary]


class CreateVipCustomPackageRequest(BaseModel):
    travelStart: str
    travelEnd: str
    guestCount: int = Field(default=1, ge=1, le=50)
    preferences: str | None = Field(default=None, max_length=2000)
    guestPhone: str | None = Field(default=None, max_length=30)


class VipCustomPackageRequestSummary(BaseModel):
    id: str
    guestUserId: str
    guestName: str
    guestEmail: str
    guestPhone: str | None = None
    travelStart: str
    travelEnd: str
    guestCount: int
    preferences: str | None = None
    status: str
    createdAt: str


class ListVipCustomPackageRequestsResponse(BaseModel):
    requests: list[VipCustomPackageRequestSummary]


class UpdateGuestProfileRequest(BaseModel):
    fullName: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    avatarUrl: str | None = Field(default=None, max_length=2048)
    dateOfBirth: str | None = Field(default=None, max_length=10)


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
    mapLink: str | None = None
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
    mapLink: str | None = Field(default=None, max_length=500)
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
    mapLink: str | None = Field(default=None, max_length=500)
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
    mapLink: str | None = None
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


class AdminModerationReview(BaseModel):
    id: str
    kind: str  # experience | homestay
    listingId: str
    listingTitle: str | None = None
    rating: int
    comment: str | None = None
    reviewerDisplayName: str | None = None
    status: str
    createdAt: str


class AdminModerationReviewsResponse(BaseModel):
    experiences: list[AdminModerationReview]
    homestays: list[AdminModerationReview]


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
    # Derived platform analytics
    conversionRatePercent: float = 0.0
    cancelRatePercent: float = 0.0
    bookingsLast30Days: int = 0
    bookingsPrev30Days: int = 0
    bookingGrowthPercent: float = 0.0
    gmvLast30DaysMinor: int = 0
    gmvPrev30DaysMinor: int = 0
    gmvGrowthPercent: float = 0.0


class AdminRiskSignal(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    detail: str
    evidence: list[str] = []
    entityType: str | None = None
    entityId: str | None = None
    href: str | None = None
    search: dict[str, str] | None = None




class AdminHomestayStats(BaseModel):
    totalOwners: int = 0
    publishedHomestays: int = 0
    pendingApprovals: int = 0
    totalBookings: int = 0
    pendingBookings: int = 0
    confirmedBookings: int = 0
    completedBookings: int = 0
    cancelledBookings: int = 0
    grossBookingValueMinor: int = 0
    revenueCollectedMinor: int = 0
    platformRevenueMinor: int = 0
    ownerPayoutDueMinor: int = 0
    codPendingCollectionMinor: int = 0
    currencySymbol: str = "₹"
    commissionPercent: float = 10.0


class AdminHomestayBookingRow(BaseModel):
    id: str
    homestayId: str
    homestayTitle: str
    guestName: str | None = None
    checkIn: str
    checkOut: str
    bookingStatus: str
    createdAt: str = ""


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
    isPaused: bool = False
