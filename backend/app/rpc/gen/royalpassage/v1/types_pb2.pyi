from google.protobuf import struct_pb2 as _struct_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Slot(_message.Message):
    __slots__ = ("id", "date", "start", "end", "capacity", "available")
    ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    START_FIELD_NUMBER: _ClassVar[int]
    END_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    id: str
    date: str
    start: str
    end: str
    capacity: int
    available: int
    def __init__(self, id: _Optional[str] = ..., date: _Optional[str] = ..., start: _Optional[str] = ..., end: _Optional[str] = ..., capacity: _Optional[int] = ..., available: _Optional[int] = ...) -> None: ...

class CitySummary(_message.Message):
    __slots__ = ("slug", "name", "region", "state", "tagline", "description")
    SLUG_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    STATE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    slug: str
    name: str
    region: str
    state: str
    tagline: str
    description: str
    def __init__(self, slug: _Optional[str] = ..., name: _Optional[str] = ..., region: _Optional[str] = ..., state: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ...) -> None: ...

class Experience(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "category", "city", "city_slug", "address", "duration_hours", "host_name", "host_bio", "verified_host", "price_per_person", "rating", "reviews_count", "image", "inclusions", "cancellation", "slots", "currency_symbol", "min_guests_per_booking", "max_guests_per_booking", "gallery_urls", "exclusions", "requirements", "region", "map_link")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    DURATION_HOURS_FIELD_NUMBER: _ClassVar[int]
    HOST_NAME_FIELD_NUMBER: _ClassVar[int]
    HOST_BIO_FIELD_NUMBER: _ClassVar[int]
    VERIFIED_HOST_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_FIELD_NUMBER: _ClassVar[int]
    RATING_FIELD_NUMBER: _ClassVar[int]
    REVIEWS_COUNT_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    INCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    CANCELLATION_FIELD_NUMBER: _ClassVar[int]
    SLOTS_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    MIN_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    EXCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    REQUIREMENTS_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    category: str
    city: str
    city_slug: str
    address: str
    duration_hours: float
    host_name: str
    host_bio: str
    verified_host: bool
    price_per_person: int
    rating: float
    reviews_count: int
    image: str
    inclusions: _containers.RepeatedScalarFieldContainer[str]
    cancellation: str
    slots: _containers.RepeatedCompositeFieldContainer[Slot]
    currency_symbol: str
    min_guests_per_booking: int
    max_guests_per_booking: int
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    exclusions: _containers.RepeatedScalarFieldContainer[str]
    requirements: _containers.RepeatedScalarFieldContainer[str]
    region: str
    map_link: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., category: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., address: _Optional[str] = ..., duration_hours: _Optional[float] = ..., host_name: _Optional[str] = ..., host_bio: _Optional[str] = ..., verified_host: _Optional[bool] = ..., price_per_person: _Optional[int] = ..., rating: _Optional[float] = ..., reviews_count: _Optional[int] = ..., image: _Optional[str] = ..., inclusions: _Optional[_Iterable[str]] = ..., cancellation: _Optional[str] = ..., slots: _Optional[_Iterable[_Union[Slot, _Mapping]]] = ..., currency_symbol: _Optional[str] = ..., min_guests_per_booking: _Optional[int] = ..., max_guests_per_booking: _Optional[int] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., exclusions: _Optional[_Iterable[str]] = ..., requirements: _Optional[_Iterable[str]] = ..., region: _Optional[str] = ..., map_link: _Optional[str] = ...) -> None: ...

class CatalogResponse(_message.Message):
    __slots__ = ("mode", "experiences", "categories", "cities", "city_slugs")
    MODE_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCES_FIELD_NUMBER: _ClassVar[int]
    CATEGORIES_FIELD_NUMBER: _ClassVar[int]
    CITIES_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUGS_FIELD_NUMBER: _ClassVar[int]
    mode: str
    experiences: _containers.RepeatedCompositeFieldContainer[Experience]
    categories: _containers.RepeatedScalarFieldContainer[str]
    cities: _containers.RepeatedScalarFieldContainer[str]
    city_slugs: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, mode: _Optional[str] = ..., experiences: _Optional[_Iterable[_Union[Experience, _Mapping]]] = ..., categories: _Optional[_Iterable[str]] = ..., cities: _Optional[_Iterable[str]] = ..., city_slugs: _Optional[_Iterable[str]] = ...) -> None: ...

class ExperienceDetailResponse(_message.Message):
    __slots__ = ("exp", "source")
    EXP_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    exp: Experience
    source: str
    def __init__(self, exp: _Optional[_Union[Experience, _Mapping]] = ..., source: _Optional[str] = ...) -> None: ...

class CreateBookingRequest(_message.Message):
    __slots__ = ("slot_id", "guest_count", "notes")
    SLOT_ID_FIELD_NUMBER: _ClassVar[int]
    GUEST_COUNT_FIELD_NUMBER: _ClassVar[int]
    NOTES_FIELD_NUMBER: _ClassVar[int]
    slot_id: str
    guest_count: int
    notes: str
    def __init__(self, slot_id: _Optional[str] = ..., guest_count: _Optional[int] = ..., notes: _Optional[str] = ...) -> None: ...

class CreateBookingResponse(_message.Message):
    __slots__ = ("booking_id", "total_amount", "currency_code", "booking_status", "payment_status", "payment_method")
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    TOTAL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    BOOKING_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_METHOD_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    total_amount: int
    currency_code: str
    booking_status: str
    payment_status: str
    payment_method: str
    def __init__(self, booking_id: _Optional[str] = ..., total_amount: _Optional[int] = ..., currency_code: _Optional[str] = ..., booking_status: _Optional[str] = ..., payment_status: _Optional[str] = ..., payment_method: _Optional[str] = ...) -> None: ...

class BookingSlotSummary(_message.Message):
    __slots__ = ("id", "date", "start", "end")
    ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    START_FIELD_NUMBER: _ClassVar[int]
    END_FIELD_NUMBER: _ClassVar[int]
    id: str
    date: str
    start: str
    end: str
    def __init__(self, id: _Optional[str] = ..., date: _Optional[str] = ..., start: _Optional[str] = ..., end: _Optional[str] = ...) -> None: ...

class BookingExperienceSummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "address", "image", "host_name")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    HOST_NAME_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    address: str
    image: str
    host_name: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., address: _Optional[str] = ..., image: _Optional[str] = ..., host_name: _Optional[str] = ...) -> None: ...

class BookingSummary(_message.Message):
    __slots__ = ("id", "experience", "slot", "participant_count", "total_amount", "currency_code", "currency_symbol", "booking_status", "payment_status", "payment_method", "notes", "created_at", "confirmed_at", "guest_name", "guest_email", "guest_phone", "is_paused", "paused_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_FIELD_NUMBER: _ClassVar[int]
    SLOT_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_COUNT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    BOOKING_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_METHOD_FIELD_NUMBER: _ClassVar[int]
    NOTES_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    CONFIRMED_AT_FIELD_NUMBER: _ClassVar[int]
    GUEST_NAME_FIELD_NUMBER: _ClassVar[int]
    GUEST_EMAIL_FIELD_NUMBER: _ClassVar[int]
    GUEST_PHONE_FIELD_NUMBER: _ClassVar[int]
    IS_PAUSED_FIELD_NUMBER: _ClassVar[int]
    PAUSED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    experience: BookingExperienceSummary
    slot: BookingSlotSummary
    participant_count: int
    total_amount: int
    currency_code: str
    currency_symbol: str
    booking_status: str
    payment_status: str
    payment_method: str
    notes: str
    created_at: str
    confirmed_at: str
    guest_name: str
    guest_email: str
    guest_phone: str
    is_paused: bool
    paused_at: str
    def __init__(self, id: _Optional[str] = ..., experience: _Optional[_Union[BookingExperienceSummary, _Mapping]] = ..., slot: _Optional[_Union[BookingSlotSummary, _Mapping]] = ..., participant_count: _Optional[int] = ..., total_amount: _Optional[int] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., booking_status: _Optional[str] = ..., payment_status: _Optional[str] = ..., payment_method: _Optional[str] = ..., notes: _Optional[str] = ..., created_at: _Optional[str] = ..., confirmed_at: _Optional[str] = ..., guest_name: _Optional[str] = ..., guest_email: _Optional[str] = ..., guest_phone: _Optional[str] = ..., is_paused: _Optional[bool] = ..., paused_at: _Optional[str] = ...) -> None: ...

class HostDashboardStats(_message.Message):
    __slots__ = ("pending_bookings", "confirmed_bookings", "completed_bookings", "revenue_collected_minor", "revenue_pending_minor", "week_revenue_estimate_minor", "upcoming_bookings", "today_bookings", "published_experiences", "currency_symbol", "total_bookings")
    PENDING_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    CONFIRMED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    COMPLETED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    REVENUE_COLLECTED_MINOR_FIELD_NUMBER: _ClassVar[int]
    REVENUE_PENDING_MINOR_FIELD_NUMBER: _ClassVar[int]
    WEEK_REVENUE_ESTIMATE_MINOR_FIELD_NUMBER: _ClassVar[int]
    UPCOMING_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    TODAY_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_EXPERIENCES_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    TOTAL_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    revenue_collected_minor: int
    revenue_pending_minor: int
    week_revenue_estimate_minor: int
    upcoming_bookings: int
    today_bookings: int
    published_experiences: int
    currency_symbol: str
    total_bookings: int
    def __init__(self, pending_bookings: _Optional[int] = ..., confirmed_bookings: _Optional[int] = ..., completed_bookings: _Optional[int] = ..., revenue_collected_minor: _Optional[int] = ..., revenue_pending_minor: _Optional[int] = ..., week_revenue_estimate_minor: _Optional[int] = ..., upcoming_bookings: _Optional[int] = ..., today_bookings: _Optional[int] = ..., published_experiences: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., total_bookings: _Optional[int] = ...) -> None: ...

class HostRevenueDay(_message.Message):
    __slots__ = ("date", "collected_minor", "pending_minor", "estimated_minor")
    DATE_FIELD_NUMBER: _ClassVar[int]
    COLLECTED_MINOR_FIELD_NUMBER: _ClassVar[int]
    PENDING_MINOR_FIELD_NUMBER: _ClassVar[int]
    ESTIMATED_MINOR_FIELD_NUMBER: _ClassVar[int]
    date: str
    collected_minor: int
    pending_minor: int
    estimated_minor: int
    def __init__(self, date: _Optional[str] = ..., collected_minor: _Optional[int] = ..., pending_minor: _Optional[int] = ..., estimated_minor: _Optional[int] = ...) -> None: ...

class HostRevenueSummary(_message.Message):
    __slots__ = ("collected_minor", "pending_minor", "estimated_minor", "week", "currency_symbol")
    COLLECTED_MINOR_FIELD_NUMBER: _ClassVar[int]
    PENDING_MINOR_FIELD_NUMBER: _ClassVar[int]
    ESTIMATED_MINOR_FIELD_NUMBER: _ClassVar[int]
    WEEK_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    collected_minor: int
    pending_minor: int
    estimated_minor: int
    week: _containers.RepeatedCompositeFieldContainer[HostRevenueDay]
    currency_symbol: str
    def __init__(self, collected_minor: _Optional[int] = ..., pending_minor: _Optional[int] = ..., estimated_minor: _Optional[int] = ..., week: _Optional[_Iterable[_Union[HostRevenueDay, _Mapping]]] = ..., currency_symbol: _Optional[str] = ...) -> None: ...

class HostReviewSummary(_message.Message):
    __slots__ = ("id", "experience_id", "experience_title", "rating", "comment", "reviewer_display_name", "host_reply", "host_replied_at", "is_verified", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_TITLE_FIELD_NUMBER: _ClassVar[int]
    RATING_FIELD_NUMBER: _ClassVar[int]
    COMMENT_FIELD_NUMBER: _ClassVar[int]
    REVIEWER_DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    HOST_REPLY_FIELD_NUMBER: _ClassVar[int]
    HOST_REPLIED_AT_FIELD_NUMBER: _ClassVar[int]
    IS_VERIFIED_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    experience_id: str
    experience_title: str
    rating: int
    comment: str
    reviewer_display_name: str
    host_reply: str
    host_replied_at: str
    is_verified: bool
    created_at: str
    def __init__(self, id: _Optional[str] = ..., experience_id: _Optional[str] = ..., experience_title: _Optional[str] = ..., rating: _Optional[int] = ..., comment: _Optional[str] = ..., reviewer_display_name: _Optional[str] = ..., host_reply: _Optional[str] = ..., host_replied_at: _Optional[str] = ..., is_verified: _Optional[bool] = ..., created_at: _Optional[str] = ...) -> None: ...

class ManagedUser(_message.Message):
    __slots__ = ("id", "email", "full_name", "phone", "role", "host_id", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    full_name: str
    phone: str
    role: str
    host_id: str
    created_at: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., full_name: _Optional[str] = ..., phone: _Optional[str] = ..., role: _Optional[str] = ..., host_id: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class CreateHostRequest(_message.Message):
    __slots__ = ("display_name", "email", "password", "phone", "bio")
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PASSWORD_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    BIO_FIELD_NUMBER: _ClassVar[int]
    display_name: str
    email: str
    password: str
    phone: str
    bio: str
    def __init__(self, display_name: _Optional[str] = ..., email: _Optional[str] = ..., password: _Optional[str] = ..., phone: _Optional[str] = ..., bio: _Optional[str] = ...) -> None: ...

class CreateHostResponse(_message.Message):
    __slots__ = ("id", "email", "display_name", "host_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    display_name: str
    host_id: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., display_name: _Optional[str] = ..., host_id: _Optional[str] = ...) -> None: ...

class CreatePlatformUserRequest(_message.Message):
    __slots__ = ("role", "full_name", "email", "password", "phone", "bio", "address")
    ROLE_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PASSWORD_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    BIO_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    role: str
    full_name: str
    email: str
    password: str
    phone: str
    bio: str
    address: str
    def __init__(self, role: _Optional[str] = ..., full_name: _Optional[str] = ..., email: _Optional[str] = ..., password: _Optional[str] = ..., phone: _Optional[str] = ..., bio: _Optional[str] = ..., address: _Optional[str] = ...) -> None: ...

class CreatePlatformUserResponse(_message.Message):
    __slots__ = ("id", "email", "full_name", "role", "host_id", "homestay_owner_id", "vip_owner_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    HOST_ID_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_OWNER_ID_FIELD_NUMBER: _ClassVar[int]
    VIP_OWNER_ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    full_name: str
    role: str
    host_id: str
    homestay_owner_id: str
    vip_owner_id: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., full_name: _Optional[str] = ..., role: _Optional[str] = ..., host_id: _Optional[str] = ..., homestay_owner_id: _Optional[str] = ..., vip_owner_id: _Optional[str] = ...) -> None: ...

class GuestProfile(_message.Message):
    __slots__ = ("id", "email", "full_name", "phone", "role", "created_at", "avatar_url", "date_of_birth", "vip_membership_status", "vip_membership_rejected_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ROLE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    AVATAR_URL_FIELD_NUMBER: _ClassVar[int]
    DATE_OF_BIRTH_FIELD_NUMBER: _ClassVar[int]
    VIP_MEMBERSHIP_STATUS_FIELD_NUMBER: _ClassVar[int]
    VIP_MEMBERSHIP_REJECTED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    full_name: str
    phone: str
    role: str
    created_at: str
    avatar_url: str
    date_of_birth: str
    vip_membership_status: str
    vip_membership_rejected_at: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., full_name: _Optional[str] = ..., phone: _Optional[str] = ..., role: _Optional[str] = ..., created_at: _Optional[str] = ..., avatar_url: _Optional[str] = ..., date_of_birth: _Optional[str] = ..., vip_membership_status: _Optional[str] = ..., vip_membership_rejected_at: _Optional[str] = ...) -> None: ...

class UpdateGuestProfileRequest(_message.Message):
    __slots__ = ("full_name", "phone", "avatar_url", "date_of_birth")
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    AVATAR_URL_FIELD_NUMBER: _ClassVar[int]
    DATE_OF_BIRTH_FIELD_NUMBER: _ClassVar[int]
    full_name: str
    phone: str
    avatar_url: str
    date_of_birth: str
    def __init__(self, full_name: _Optional[str] = ..., phone: _Optional[str] = ..., avatar_url: _Optional[str] = ..., date_of_birth: _Optional[str] = ...) -> None: ...

class WishlistExperienceSummary(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "city", "image", "price_per_person", "rating", "reviews_count", "currency_symbol", "host_name")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_FIELD_NUMBER: _ClassVar[int]
    RATING_FIELD_NUMBER: _ClassVar[int]
    REVIEWS_COUNT_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    HOST_NAME_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    city: str
    image: str
    price_per_person: int
    rating: float
    reviews_count: int
    currency_symbol: str
    host_name: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., city: _Optional[str] = ..., image: _Optional[str] = ..., price_per_person: _Optional[int] = ..., rating: _Optional[float] = ..., reviews_count: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., host_name: _Optional[str] = ...) -> None: ...

class WishlistItem(_message.Message):
    __slots__ = ("experience_id", "saved_at", "experience")
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    SAVED_AT_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    saved_at: str
    experience: WishlistExperienceSummary
    def __init__(self, experience_id: _Optional[str] = ..., saved_at: _Optional[str] = ..., experience: _Optional[_Union[WishlistExperienceSummary, _Mapping]] = ...) -> None: ...

class CategoryOption(_message.Message):
    __slots__ = ("slug", "label")
    SLUG_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
    slug: str
    label: str
    def __init__(self, slug: _Optional[str] = ..., label: _Optional[str] = ...) -> None: ...

class HostSlotDetail(_message.Message):
    __slots__ = ("id", "date", "start", "end", "capacity", "seats_sold", "available", "is_blocked")
    ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    START_FIELD_NUMBER: _ClassVar[int]
    END_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    SEATS_SOLD_FIELD_NUMBER: _ClassVar[int]
    AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    IS_BLOCKED_FIELD_NUMBER: _ClassVar[int]
    id: str
    date: str
    start: str
    end: str
    capacity: int
    seats_sold: int
    available: int
    is_blocked: bool
    def __init__(self, id: _Optional[str] = ..., date: _Optional[str] = ..., start: _Optional[str] = ..., end: _Optional[str] = ..., capacity: _Optional[int] = ..., seats_sold: _Optional[int] = ..., available: _Optional[int] = ..., is_blocked: _Optional[bool] = ...) -> None: ...

class HostExperienceSummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "status", "price_per_person_minor", "currency_symbol", "slot_count", "image")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_MINOR_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    SLOT_COUNT_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    status: str
    price_per_person_minor: int
    currency_symbol: str
    slot_count: int
    image: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., status: _Optional[str] = ..., price_per_person_minor: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., slot_count: _Optional[int] = ..., image: _Optional[str] = ...) -> None: ...

class HostExperienceDetail(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "category_slug", "category_label", "city", "city_slug", "region", "address", "duration_minutes", "price_per_person_minor", "status", "hero_image_url", "inclusions", "exclusions", "requirements", "cancellation_policy", "min_guests_per_booking", "max_guests_per_booking", "currency_code", "currency_symbol", "slots", "created_at", "updated_at", "gallery_urls", "map_link")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_LABEL_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_MINOR_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    INCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    EXCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    REQUIREMENTS_FIELD_NUMBER: _ClassVar[int]
    CANCELLATION_POLICY_FIELD_NUMBER: _ClassVar[int]
    MIN_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    SLOTS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    category_slug: str
    category_label: str
    city: str
    city_slug: str
    region: str
    address: str
    duration_minutes: int
    price_per_person_minor: int
    status: str
    hero_image_url: str
    inclusions: _containers.RepeatedScalarFieldContainer[str]
    exclusions: _containers.RepeatedScalarFieldContainer[str]
    requirements: _containers.RepeatedScalarFieldContainer[str]
    cancellation_policy: str
    min_guests_per_booking: int
    max_guests_per_booking: int
    currency_code: str
    currency_symbol: str
    slots: _containers.RepeatedCompositeFieldContainer[HostSlotDetail]
    created_at: str
    updated_at: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    map_link: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., category_slug: _Optional[str] = ..., category_label: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., price_per_person_minor: _Optional[int] = ..., status: _Optional[str] = ..., hero_image_url: _Optional[str] = ..., inclusions: _Optional[_Iterable[str]] = ..., exclusions: _Optional[_Iterable[str]] = ..., requirements: _Optional[_Iterable[str]] = ..., cancellation_policy: _Optional[str] = ..., min_guests_per_booking: _Optional[int] = ..., max_guests_per_booking: _Optional[int] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., slots: _Optional[_Iterable[_Union[HostSlotDetail, _Mapping]]] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., map_link: _Optional[str] = ...) -> None: ...

class CreateHostExperienceRequest(_message.Message):
    __slots__ = ("title", "slug", "tagline", "description", "category_slug", "city_slug", "city", "region", "address", "duration_minutes", "price_per_person_minor", "hero_image_url", "inclusions", "exclusions", "requirements", "cancellation_policy", "min_guests_per_booking", "max_guests_per_booking", "submit_for_review", "gallery_urls", "map_link")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_MINOR_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    INCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    EXCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    REQUIREMENTS_FIELD_NUMBER: _ClassVar[int]
    CANCELLATION_POLICY_FIELD_NUMBER: _ClassVar[int]
    MIN_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    SUBMIT_FOR_REVIEW_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    title: str
    slug: str
    tagline: str
    description: str
    category_slug: str
    city_slug: str
    city: str
    region: str
    address: str
    duration_minutes: int
    price_per_person_minor: int
    hero_image_url: str
    inclusions: _containers.RepeatedScalarFieldContainer[str]
    exclusions: _containers.RepeatedScalarFieldContainer[str]
    requirements: _containers.RepeatedScalarFieldContainer[str]
    cancellation_policy: str
    min_guests_per_booking: int
    max_guests_per_booking: int
    submit_for_review: bool
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    map_link: str
    def __init__(self, title: _Optional[str] = ..., slug: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., category_slug: _Optional[str] = ..., city_slug: _Optional[str] = ..., city: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., price_per_person_minor: _Optional[int] = ..., hero_image_url: _Optional[str] = ..., inclusions: _Optional[_Iterable[str]] = ..., exclusions: _Optional[_Iterable[str]] = ..., requirements: _Optional[_Iterable[str]] = ..., cancellation_policy: _Optional[str] = ..., min_guests_per_booking: _Optional[int] = ..., max_guests_per_booking: _Optional[int] = ..., submit_for_review: _Optional[bool] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., map_link: _Optional[str] = ...) -> None: ...

class UpdateHostExperienceRequest(_message.Message):
    __slots__ = ("title", "slug", "tagline", "description", "category_slug", "city_slug", "city", "region", "address", "duration_minutes", "price_per_person_minor", "hero_image_url", "inclusions", "exclusions", "requirements", "cancellation_policy", "min_guests_per_booking", "max_guests_per_booking", "submit_for_review", "gallery_urls", "map_link")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_MINOR_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    INCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    EXCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    REQUIREMENTS_FIELD_NUMBER: _ClassVar[int]
    CANCELLATION_POLICY_FIELD_NUMBER: _ClassVar[int]
    MIN_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    SUBMIT_FOR_REVIEW_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    title: str
    slug: str
    tagline: str
    description: str
    category_slug: str
    city_slug: str
    city: str
    region: str
    address: str
    duration_minutes: int
    price_per_person_minor: int
    hero_image_url: str
    inclusions: _containers.RepeatedScalarFieldContainer[str]
    exclusions: _containers.RepeatedScalarFieldContainer[str]
    requirements: _containers.RepeatedScalarFieldContainer[str]
    cancellation_policy: str
    min_guests_per_booking: int
    max_guests_per_booking: int
    submit_for_review: bool
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    map_link: str
    def __init__(self, title: _Optional[str] = ..., slug: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., category_slug: _Optional[str] = ..., city_slug: _Optional[str] = ..., city: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., price_per_person_minor: _Optional[int] = ..., hero_image_url: _Optional[str] = ..., inclusions: _Optional[_Iterable[str]] = ..., exclusions: _Optional[_Iterable[str]] = ..., requirements: _Optional[_Iterable[str]] = ..., cancellation_policy: _Optional[str] = ..., min_guests_per_booking: _Optional[int] = ..., max_guests_per_booking: _Optional[int] = ..., submit_for_review: _Optional[bool] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., map_link: _Optional[str] = ...) -> None: ...

class CreateHostSlotRequest(_message.Message):
    __slots__ = ("slot_date", "start_time", "end_time", "capacity")
    SLOT_DATE_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    slot_date: str
    start_time: str
    end_time: str
    capacity: int
    def __init__(self, slot_date: _Optional[str] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., capacity: _Optional[int] = ...) -> None: ...

class UpdateHostSlotRequest(_message.Message):
    __slots__ = ("slot_date", "start_time", "end_time", "capacity", "is_blocked")
    SLOT_DATE_FIELD_NUMBER: _ClassVar[int]
    START_TIME_FIELD_NUMBER: _ClassVar[int]
    END_TIME_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    IS_BLOCKED_FIELD_NUMBER: _ClassVar[int]
    slot_date: str
    start_time: str
    end_time: str
    capacity: int
    is_blocked: bool
    def __init__(self, slot_date: _Optional[str] = ..., start_time: _Optional[str] = ..., end_time: _Optional[str] = ..., capacity: _Optional[int] = ..., is_blocked: _Optional[bool] = ...) -> None: ...

class AdminExperienceSummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "status", "host_name", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HOST_NAME_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    status: str
    host_name: str
    created_at: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., status: _Optional[str] = ..., host_name: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class AdminExperienceDetail(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "category_slug", "category_label", "city", "city_slug", "region", "address", "duration_minutes", "price_per_person_minor", "status", "hero_image_url", "inclusions", "exclusions", "requirements", "cancellation_policy", "min_guests_per_booking", "max_guests_per_booking", "currency_code", "currency_symbol", "slots", "created_at", "updated_at", "gallery_urls", "map_link", "host_name", "host_email", "host_phone", "host_bio", "host_verified")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_LABEL_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    DURATION_MINUTES_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_PERSON_MINOR_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    INCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    EXCLUSIONS_FIELD_NUMBER: _ClassVar[int]
    REQUIREMENTS_FIELD_NUMBER: _ClassVar[int]
    CANCELLATION_POLICY_FIELD_NUMBER: _ClassVar[int]
    MIN_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_PER_BOOKING_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    SLOTS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    HOST_NAME_FIELD_NUMBER: _ClassVar[int]
    HOST_EMAIL_FIELD_NUMBER: _ClassVar[int]
    HOST_PHONE_FIELD_NUMBER: _ClassVar[int]
    HOST_BIO_FIELD_NUMBER: _ClassVar[int]
    HOST_VERIFIED_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    category_slug: str
    category_label: str
    city: str
    city_slug: str
    region: str
    address: str
    duration_minutes: int
    price_per_person_minor: int
    status: str
    hero_image_url: str
    inclusions: _containers.RepeatedScalarFieldContainer[str]
    exclusions: _containers.RepeatedScalarFieldContainer[str]
    requirements: _containers.RepeatedScalarFieldContainer[str]
    cancellation_policy: str
    min_guests_per_booking: int
    max_guests_per_booking: int
    currency_code: str
    currency_symbol: str
    slots: _containers.RepeatedCompositeFieldContainer[HostSlotDetail]
    created_at: str
    updated_at: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    map_link: str
    host_name: str
    host_email: str
    host_phone: str
    host_bio: str
    host_verified: bool
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., category_slug: _Optional[str] = ..., category_label: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., duration_minutes: _Optional[int] = ..., price_per_person_minor: _Optional[int] = ..., status: _Optional[str] = ..., hero_image_url: _Optional[str] = ..., inclusions: _Optional[_Iterable[str]] = ..., exclusions: _Optional[_Iterable[str]] = ..., requirements: _Optional[_Iterable[str]] = ..., cancellation_policy: _Optional[str] = ..., min_guests_per_booking: _Optional[int] = ..., max_guests_per_booking: _Optional[int] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., slots: _Optional[_Iterable[_Union[HostSlotDetail, _Mapping]]] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., map_link: _Optional[str] = ..., host_name: _Optional[str] = ..., host_email: _Optional[str] = ..., host_phone: _Optional[str] = ..., host_bio: _Optional[str] = ..., host_verified: _Optional[bool] = ...) -> None: ...

class ReviewSummary(_message.Message):
    __slots__ = ("id", "experience_id", "booking_id", "rating", "comment", "reviewer_display_name", "host_reply", "host_replied_at", "is_verified", "status", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    RATING_FIELD_NUMBER: _ClassVar[int]
    COMMENT_FIELD_NUMBER: _ClassVar[int]
    REVIEWER_DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    HOST_REPLY_FIELD_NUMBER: _ClassVar[int]
    HOST_REPLIED_AT_FIELD_NUMBER: _ClassVar[int]
    IS_VERIFIED_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    experience_id: str
    booking_id: str
    rating: int
    comment: str
    reviewer_display_name: str
    host_reply: str
    host_replied_at: str
    is_verified: bool
    status: str
    created_at: str
    def __init__(self, id: _Optional[str] = ..., experience_id: _Optional[str] = ..., booking_id: _Optional[str] = ..., rating: _Optional[int] = ..., comment: _Optional[str] = ..., reviewer_display_name: _Optional[str] = ..., host_reply: _Optional[str] = ..., host_replied_at: _Optional[str] = ..., is_verified: _Optional[bool] = ..., status: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class CreateReviewRequest(_message.Message):
    __slots__ = ("booking_id", "rating", "comment")
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    RATING_FIELD_NUMBER: _ClassVar[int]
    COMMENT_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    rating: int
    comment: str
    def __init__(self, booking_id: _Optional[str] = ..., rating: _Optional[int] = ..., comment: _Optional[str] = ...) -> None: ...

class HostReplyRequest(_message.Message):
    __slots__ = ("reply",)
    REPLY_FIELD_NUMBER: _ClassVar[int]
    reply: str
    def __init__(self, reply: _Optional[str] = ...) -> None: ...

class NotificationSummary(_message.Message):
    __slots__ = ("id", "type", "title", "body", "metadata", "read_at", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    BODY_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    READ_AT_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    type: str
    title: str
    body: str
    metadata: _struct_pb2.Struct
    read_at: str
    created_at: str
    def __init__(self, id: _Optional[str] = ..., type: _Optional[str] = ..., title: _Optional[str] = ..., body: _Optional[str] = ..., metadata: _Optional[_Union[_struct_pb2.Struct, _Mapping]] = ..., read_at: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class AuditLogEntry(_message.Message):
    __slots__ = ("id", "action", "entity_type", "entity_id", "actor_name", "metadata", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    ACTION_FIELD_NUMBER: _ClassVar[int]
    ENTITY_TYPE_FIELD_NUMBER: _ClassVar[int]
    ENTITY_ID_FIELD_NUMBER: _ClassVar[int]
    ACTOR_NAME_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    action: str
    entity_type: str
    entity_id: str
    actor_name: str
    metadata: _struct_pb2.Struct
    created_at: str
    def __init__(self, id: _Optional[str] = ..., action: _Optional[str] = ..., entity_type: _Optional[str] = ..., entity_id: _Optional[str] = ..., actor_name: _Optional[str] = ..., metadata: _Optional[_Union[_struct_pb2.Struct, _Mapping]] = ..., created_at: _Optional[str] = ...) -> None: ...

class AdminStats(_message.Message):
    __slots__ = ("total_guests", "total_hosts", "published_experiences", "total_bookings", "revenue_collected_minor", "pending_experience_reviews", "currency_symbol", "confirmed_bookings", "pending_bookings", "completed_bookings", "cancelled_bookings", "gross_booking_value_minor", "platform_revenue_minor", "host_payout_due_minor", "cod_pending_collection_minor", "commission_percent")
    TOTAL_GUESTS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_HOSTS_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_EXPERIENCES_FIELD_NUMBER: _ClassVar[int]
    TOTAL_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    REVENUE_COLLECTED_MINOR_FIELD_NUMBER: _ClassVar[int]
    PENDING_EXPERIENCE_REVIEWS_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    CONFIRMED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    PENDING_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    COMPLETED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    CANCELLED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    GROSS_BOOKING_VALUE_MINOR_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_REVENUE_MINOR_FIELD_NUMBER: _ClassVar[int]
    HOST_PAYOUT_DUE_MINOR_FIELD_NUMBER: _ClassVar[int]
    COD_PENDING_COLLECTION_MINOR_FIELD_NUMBER: _ClassVar[int]
    COMMISSION_PERCENT_FIELD_NUMBER: _ClassVar[int]
    total_guests: int
    total_hosts: int
    published_experiences: int
    total_bookings: int
    revenue_collected_minor: int
    pending_experience_reviews: int
    currency_symbol: str
    confirmed_bookings: int
    pending_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    gross_booking_value_minor: int
    platform_revenue_minor: int
    host_payout_due_minor: int
    cod_pending_collection_minor: int
    commission_percent: float
    def __init__(self, total_guests: _Optional[int] = ..., total_hosts: _Optional[int] = ..., published_experiences: _Optional[int] = ..., total_bookings: _Optional[int] = ..., revenue_collected_minor: _Optional[int] = ..., pending_experience_reviews: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., confirmed_bookings: _Optional[int] = ..., pending_bookings: _Optional[int] = ..., completed_bookings: _Optional[int] = ..., cancelled_bookings: _Optional[int] = ..., gross_booking_value_minor: _Optional[int] = ..., platform_revenue_minor: _Optional[int] = ..., host_payout_due_minor: _Optional[int] = ..., cod_pending_collection_minor: _Optional[int] = ..., commission_percent: _Optional[float] = ...) -> None: ...

class AdminBookingRow(_message.Message):
    __slots__ = ("id", "guest_name", "guest_email", "experience_title", "booking_status", "payment_status", "total_amount", "currency_symbol", "created_at", "platform_fee_minor", "host_payout_minor", "host_name", "is_paused", "slot_date")
    ID_FIELD_NUMBER: _ClassVar[int]
    GUEST_NAME_FIELD_NUMBER: _ClassVar[int]
    GUEST_EMAIL_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_TITLE_FIELD_NUMBER: _ClassVar[int]
    BOOKING_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    TOTAL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    PLATFORM_FEE_MINOR_FIELD_NUMBER: _ClassVar[int]
    HOST_PAYOUT_MINOR_FIELD_NUMBER: _ClassVar[int]
    HOST_NAME_FIELD_NUMBER: _ClassVar[int]
    IS_PAUSED_FIELD_NUMBER: _ClassVar[int]
    SLOT_DATE_FIELD_NUMBER: _ClassVar[int]
    id: str
    guest_name: str
    guest_email: str
    experience_title: str
    booking_status: str
    payment_status: str
    total_amount: int
    currency_symbol: str
    created_at: str
    platform_fee_minor: int
    host_payout_minor: int
    host_name: str
    is_paused: bool
    slot_date: str
    def __init__(self, id: _Optional[str] = ..., guest_name: _Optional[str] = ..., guest_email: _Optional[str] = ..., experience_title: _Optional[str] = ..., booking_status: _Optional[str] = ..., payment_status: _Optional[str] = ..., total_amount: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., created_at: _Optional[str] = ..., platform_fee_minor: _Optional[int] = ..., host_payout_minor: _Optional[int] = ..., host_name: _Optional[str] = ..., is_paused: _Optional[bool] = ..., slot_date: _Optional[str] = ...) -> None: ...

class OkResponse(_message.Message):
    __slots__ = ("ok",)
    OK_FIELD_NUMBER: _ClassVar[int]
    ok: bool
    def __init__(self, ok: _Optional[bool] = ...) -> None: ...

class MarkAllNotificationsReadResponse(_message.Message):
    __slots__ = ("ok", "count")
    OK_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    ok: bool
    count: int
    def __init__(self, ok: _Optional[bool] = ..., count: _Optional[int] = ...) -> None: ...

class HealthResponse(_message.Message):
    __slots__ = ("status",)
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: str
    def __init__(self, status: _Optional[str] = ...) -> None: ...

class ListCitiesResponse(_message.Message):
    __slots__ = ("cities",)
    CITIES_FIELD_NUMBER: _ClassVar[int]
    cities: _containers.RepeatedCompositeFieldContainer[CitySummary]
    def __init__(self, cities: _Optional[_Iterable[_Union[CitySummary, _Mapping]]] = ...) -> None: ...

class ListBookingsResponse(_message.Message):
    __slots__ = ("bookings",)
    BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    bookings: _containers.RepeatedCompositeFieldContainer[BookingSummary]
    def __init__(self, bookings: _Optional[_Iterable[_Union[BookingSummary, _Mapping]]] = ...) -> None: ...

class ListHostReviewsResponse(_message.Message):
    __slots__ = ("reviews",)
    REVIEWS_FIELD_NUMBER: _ClassVar[int]
    reviews: _containers.RepeatedCompositeFieldContainer[HostReviewSummary]
    def __init__(self, reviews: _Optional[_Iterable[_Union[HostReviewSummary, _Mapping]]] = ...) -> None: ...

class ListHostCategoriesResponse(_message.Message):
    __slots__ = ("categories",)
    CATEGORIES_FIELD_NUMBER: _ClassVar[int]
    categories: _containers.RepeatedCompositeFieldContainer[CategoryOption]
    def __init__(self, categories: _Optional[_Iterable[_Union[CategoryOption, _Mapping]]] = ...) -> None: ...

class ListHostExperiencesResponse(_message.Message):
    __slots__ = ("experiences",)
    EXPERIENCES_FIELD_NUMBER: _ClassVar[int]
    experiences: _containers.RepeatedCompositeFieldContainer[HostExperienceSummary]
    def __init__(self, experiences: _Optional[_Iterable[_Union[HostExperienceSummary, _Mapping]]] = ...) -> None: ...

class ListAdminUsersResponse(_message.Message):
    __slots__ = ("users",)
    USERS_FIELD_NUMBER: _ClassVar[int]
    users: _containers.RepeatedCompositeFieldContainer[ManagedUser]
    def __init__(self, users: _Optional[_Iterable[_Union[ManagedUser, _Mapping]]] = ...) -> None: ...

class ListAdminExperiencesResponse(_message.Message):
    __slots__ = ("experiences",)
    EXPERIENCES_FIELD_NUMBER: _ClassVar[int]
    experiences: _containers.RepeatedCompositeFieldContainer[AdminExperienceSummary]
    def __init__(self, experiences: _Optional[_Iterable[_Union[AdminExperienceSummary, _Mapping]]] = ...) -> None: ...

class ListExperienceReviewsResponse(_message.Message):
    __slots__ = ("reviews",)
    REVIEWS_FIELD_NUMBER: _ClassVar[int]
    reviews: _containers.RepeatedCompositeFieldContainer[ReviewSummary]
    def __init__(self, reviews: _Optional[_Iterable[_Union[ReviewSummary, _Mapping]]] = ...) -> None: ...

class ListAdminReviewsResponse(_message.Message):
    __slots__ = ("reviews",)
    REVIEWS_FIELD_NUMBER: _ClassVar[int]
    reviews: _containers.RepeatedCompositeFieldContainer[ReviewSummary]
    def __init__(self, reviews: _Optional[_Iterable[_Union[ReviewSummary, _Mapping]]] = ...) -> None: ...

class ListNotificationsResponse(_message.Message):
    __slots__ = ("notifications",)
    NOTIFICATIONS_FIELD_NUMBER: _ClassVar[int]
    notifications: _containers.RepeatedCompositeFieldContainer[NotificationSummary]
    def __init__(self, notifications: _Optional[_Iterable[_Union[NotificationSummary, _Mapping]]] = ...) -> None: ...

class ListAdminActivityResponse(_message.Message):
    __slots__ = ("entries",)
    ENTRIES_FIELD_NUMBER: _ClassVar[int]
    entries: _containers.RepeatedCompositeFieldContainer[AuditLogEntry]
    def __init__(self, entries: _Optional[_Iterable[_Union[AuditLogEntry, _Mapping]]] = ...) -> None: ...

class ListAdminBookingsResponse(_message.Message):
    __slots__ = ("bookings",)
    BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    bookings: _containers.RepeatedCompositeFieldContainer[AdminBookingRow]
    def __init__(self, bookings: _Optional[_Iterable[_Union[AdminBookingRow, _Mapping]]] = ...) -> None: ...

class ListWishlistResponse(_message.Message):
    __slots__ = ("items",)
    ITEMS_FIELD_NUMBER: _ClassVar[int]
    items: _containers.RepeatedCompositeFieldContainer[WishlistItem]
    def __init__(self, items: _Optional[_Iterable[_Union[WishlistItem, _Mapping]]] = ...) -> None: ...

class HomestayRoom(_message.Message):
    __slots__ = ("id", "name", "category", "capacity", "price_per_night", "total_units", "amenities", "extra_bed_available", "extra_bed_price_per_night", "extra_beds_per_room", "weekend_price_per_night", "weekend_extra_bed_price_per_night")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_UNITS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    category: str
    capacity: int
    price_per_night: int
    total_units: int
    amenities: _containers.RepeatedScalarFieldContainer[str]
    extra_bed_available: bool
    extra_bed_price_per_night: int
    extra_beds_per_room: int
    weekend_price_per_night: int
    weekend_extra_bed_price_per_night: int
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., category: _Optional[str] = ..., capacity: _Optional[int] = ..., price_per_night: _Optional[int] = ..., total_units: _Optional[int] = ..., amenities: _Optional[_Iterable[str]] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night: _Optional[int] = ..., weekend_extra_bed_price_per_night: _Optional[int] = ...) -> None: ...

class Homestay(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "property_type", "city", "city_slug", "address", "region", "map_link", "price_per_night", "rating", "reviews_count", "image", "gallery_urls", "amenities", "house_rules", "bedrooms", "bathrooms", "max_guests", "check_in_time", "check_out_time", "currency_symbol", "owner_name", "rooms", "extra_bed_available", "extra_bed_price_per_night", "extra_beds_per_room", "weekend_price_per_night", "date_prices", "weekend_extra_bed_price_per_night")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROPERTY_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    RATING_FIELD_NUMBER: _ClassVar[int]
    REVIEWS_COUNT_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    HOUSE_RULES_FIELD_NUMBER: _ClassVar[int]
    BEDROOMS_FIELD_NUMBER: _ClassVar[int]
    BATHROOMS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TIME_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_TIME_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    OWNER_NAME_FIELD_NUMBER: _ClassVar[int]
    ROOMS_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    DATE_PRICES_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    property_type: str
    city: str
    city_slug: str
    address: str
    region: str
    map_link: str
    price_per_night: int
    rating: float
    reviews_count: int
    image: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    amenities: _containers.RepeatedScalarFieldContainer[str]
    house_rules: _containers.RepeatedScalarFieldContainer[str]
    bedrooms: int
    bathrooms: int
    max_guests: int
    check_in_time: str
    check_out_time: str
    currency_symbol: str
    owner_name: str
    rooms: _containers.RepeatedCompositeFieldContainer[HomestayRoom]
    extra_bed_available: bool
    extra_bed_price_per_night: int
    extra_beds_per_room: int
    weekend_price_per_night: int
    date_prices: _containers.RepeatedCompositeFieldContainer[HomestayDatePrice]
    weekend_extra_bed_price_per_night: int
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., property_type: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., address: _Optional[str] = ..., region: _Optional[str] = ..., map_link: _Optional[str] = ..., price_per_night: _Optional[int] = ..., rating: _Optional[float] = ..., reviews_count: _Optional[int] = ..., image: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., amenities: _Optional[_Iterable[str]] = ..., house_rules: _Optional[_Iterable[str]] = ..., bedrooms: _Optional[int] = ..., bathrooms: _Optional[int] = ..., max_guests: _Optional[int] = ..., check_in_time: _Optional[str] = ..., check_out_time: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., owner_name: _Optional[str] = ..., rooms: _Optional[_Iterable[_Union[HomestayRoom, _Mapping]]] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night: _Optional[int] = ..., date_prices: _Optional[_Iterable[_Union[HomestayDatePrice, _Mapping]]] = ..., weekend_extra_bed_price_per_night: _Optional[int] = ...) -> None: ...

class HomestayDatePrice(_message.Message):
    __slots__ = ("date", "price_per_night", "label", "extra_bed_price_per_night")
    DATE_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_FIELD_NUMBER: _ClassVar[int]
    date: str
    price_per_night: int
    label: str
    extra_bed_price_per_night: int
    def __init__(self, date: _Optional[str] = ..., price_per_night: _Optional[int] = ..., label: _Optional[str] = ..., extra_bed_price_per_night: _Optional[int] = ...) -> None: ...

class ListHomestaysResponse(_message.Message):
    __slots__ = ("mode", "homestays", "property_types", "cities")
    MODE_FIELD_NUMBER: _ClassVar[int]
    HOMESTAYS_FIELD_NUMBER: _ClassVar[int]
    PROPERTY_TYPES_FIELD_NUMBER: _ClassVar[int]
    CITIES_FIELD_NUMBER: _ClassVar[int]
    mode: str
    homestays: _containers.RepeatedCompositeFieldContainer[Homestay]
    property_types: _containers.RepeatedScalarFieldContainer[str]
    cities: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, mode: _Optional[str] = ..., homestays: _Optional[_Iterable[_Union[Homestay, _Mapping]]] = ..., property_types: _Optional[_Iterable[str]] = ..., cities: _Optional[_Iterable[str]] = ...) -> None: ...

class HomestayDetailResponse(_message.Message):
    __slots__ = ("homestay", "source")
    HOMESTAY_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    homestay: Homestay
    source: str
    def __init__(self, homestay: _Optional[_Union[Homestay, _Mapping]] = ..., source: _Optional[str] = ...) -> None: ...

class CreateHomestayOwnerRequest(_message.Message):
    __slots__ = ("full_name", "email", "password", "phone", "address")
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PASSWORD_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    full_name: str
    email: str
    password: str
    phone: str
    address: str
    def __init__(self, full_name: _Optional[str] = ..., email: _Optional[str] = ..., password: _Optional[str] = ..., phone: _Optional[str] = ..., address: _Optional[str] = ...) -> None: ...

class CreateHomestayOwnerResponse(_message.Message):
    __slots__ = ("id", "email", "full_name", "homestay_owner_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_OWNER_ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    full_name: str
    homestay_owner_id: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., full_name: _Optional[str] = ..., homestay_owner_id: _Optional[str] = ...) -> None: ...

class CreateVipOwnerRequest(_message.Message):
    __slots__ = ("full_name", "email", "password", "phone", "address")
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PASSWORD_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    full_name: str
    email: str
    password: str
    phone: str
    address: str
    def __init__(self, full_name: _Optional[str] = ..., email: _Optional[str] = ..., password: _Optional[str] = ..., phone: _Optional[str] = ..., address: _Optional[str] = ...) -> None: ...

class CreateVipOwnerResponse(_message.Message):
    __slots__ = ("id", "email", "full_name", "vip_owner_id")
    ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    VIP_OWNER_ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    email: str
    full_name: str
    vip_owner_id: str
    def __init__(self, id: _Optional[str] = ..., email: _Optional[str] = ..., full_name: _Optional[str] = ..., vip_owner_id: _Optional[str] = ...) -> None: ...

class CreateHomestayBookingRequest(_message.Message):
    __slots__ = ("homestay_id", "room_id", "check_in", "check_out", "guest_count", "notes", "room_count", "extra_bed_count")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    GUEST_COUNT_FIELD_NUMBER: _ClassVar[int]
    NOTES_FIELD_NUMBER: _ClassVar[int]
    ROOM_COUNT_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_COUNT_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    room_id: str
    check_in: str
    check_out: str
    guest_count: int
    notes: str
    room_count: int
    extra_bed_count: int
    def __init__(self, homestay_id: _Optional[str] = ..., room_id: _Optional[str] = ..., check_in: _Optional[str] = ..., check_out: _Optional[str] = ..., guest_count: _Optional[int] = ..., notes: _Optional[str] = ..., room_count: _Optional[int] = ..., extra_bed_count: _Optional[int] = ...) -> None: ...

class CreateHomestayBookingResponse(_message.Message):
    __slots__ = ("booking_id", "total_amount", "currency_code", "booking_status", "payment_status", "nights")
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    TOTAL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    BOOKING_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    NIGHTS_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    total_amount: int
    currency_code: str
    booking_status: str
    payment_status: str
    nights: int
    def __init__(self, booking_id: _Optional[str] = ..., total_amount: _Optional[int] = ..., currency_code: _Optional[str] = ..., booking_status: _Optional[str] = ..., payment_status: _Optional[str] = ..., nights: _Optional[int] = ...) -> None: ...

class OwnerHomestayAvailability(_message.Message):
    __slots__ = ("id", "date", "room_id", "is_blocked", "price_override_minor", "min_nights", "note", "extra_bed_price_override_minor")
    ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    IS_BLOCKED_FIELD_NUMBER: _ClassVar[int]
    PRICE_OVERRIDE_MINOR_FIELD_NUMBER: _ClassVar[int]
    MIN_NIGHTS_FIELD_NUMBER: _ClassVar[int]
    NOTE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_OVERRIDE_MINOR_FIELD_NUMBER: _ClassVar[int]
    id: str
    date: str
    room_id: str
    is_blocked: bool
    price_override_minor: int
    min_nights: int
    note: str
    extra_bed_price_override_minor: int
    def __init__(self, id: _Optional[str] = ..., date: _Optional[str] = ..., room_id: _Optional[str] = ..., is_blocked: _Optional[bool] = ..., price_override_minor: _Optional[int] = ..., min_nights: _Optional[int] = ..., note: _Optional[str] = ..., extra_bed_price_override_minor: _Optional[int] = ...) -> None: ...

class OwnerHomestayRoom(_message.Message):
    __slots__ = ("id", "name", "category", "capacity", "price_per_night_minor", "total_units", "amenities", "sort_order", "is_active", "extra_bed_available", "extra_bed_price_per_night_minor", "extra_beds_per_room", "weekend_price_per_night_minor", "weekend_extra_bed_price_per_night_minor")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    TOTAL_UNITS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    SORT_ORDER_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    category: str
    capacity: int
    price_per_night_minor: int
    total_units: int
    amenities: _containers.RepeatedScalarFieldContainer[str]
    sort_order: int
    is_active: bool
    extra_bed_available: bool
    extra_bed_price_per_night_minor: int
    extra_beds_per_room: int
    weekend_price_per_night_minor: int
    weekend_extra_bed_price_per_night_minor: int
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., category: _Optional[str] = ..., capacity: _Optional[int] = ..., price_per_night_minor: _Optional[int] = ..., total_units: _Optional[int] = ..., amenities: _Optional[_Iterable[str]] = ..., sort_order: _Optional[int] = ..., is_active: _Optional[bool] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night_minor: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night_minor: _Optional[int] = ..., weekend_extra_bed_price_per_night_minor: _Optional[int] = ...) -> None: ...

class OwnerHomestaySummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "status", "price_per_night_minor", "currency_symbol", "room_count", "image")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    ROOM_COUNT_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    status: str
    price_per_night_minor: int
    currency_symbol: str
    room_count: int
    image: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., status: _Optional[str] = ..., price_per_night_minor: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., room_count: _Optional[int] = ..., image: _Optional[str] = ...) -> None: ...

class OwnerHomestayDetail(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "property_type", "city", "city_slug", "region", "address", "map_link", "price_per_night_minor", "status", "hero_image_url", "gallery_urls", "amenities", "house_rules", "bedrooms", "bathrooms", "max_guests", "check_in_time", "check_out_time", "currency_code", "currency_symbol", "rooms", "availability", "created_at", "updated_at", "extra_bed_available", "extra_bed_price_per_night_minor", "extra_beds_per_room", "weekend_price_per_night_minor", "license_certificate_url", "weekend_extra_bed_price_per_night_minor")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROPERTY_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    HOUSE_RULES_FIELD_NUMBER: _ClassVar[int]
    BEDROOMS_FIELD_NUMBER: _ClassVar[int]
    BATHROOMS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TIME_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_TIME_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    ROOMS_FIELD_NUMBER: _ClassVar[int]
    AVAILABILITY_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    LICENSE_CERTIFICATE_URL_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    property_type: str
    city: str
    city_slug: str
    region: str
    address: str
    map_link: str
    price_per_night_minor: int
    status: str
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    amenities: _containers.RepeatedScalarFieldContainer[str]
    house_rules: _containers.RepeatedScalarFieldContainer[str]
    bedrooms: int
    bathrooms: int
    max_guests: int
    check_in_time: str
    check_out_time: str
    currency_code: str
    currency_symbol: str
    rooms: _containers.RepeatedCompositeFieldContainer[OwnerHomestayRoom]
    availability: _containers.RepeatedCompositeFieldContainer[OwnerHomestayAvailability]
    created_at: str
    updated_at: str
    extra_bed_available: bool
    extra_bed_price_per_night_minor: int
    extra_beds_per_room: int
    weekend_price_per_night_minor: int
    license_certificate_url: str
    weekend_extra_bed_price_per_night_minor: int
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., property_type: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., map_link: _Optional[str] = ..., price_per_night_minor: _Optional[int] = ..., status: _Optional[str] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., amenities: _Optional[_Iterable[str]] = ..., house_rules: _Optional[_Iterable[str]] = ..., bedrooms: _Optional[int] = ..., bathrooms: _Optional[int] = ..., max_guests: _Optional[int] = ..., check_in_time: _Optional[str] = ..., check_out_time: _Optional[str] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., rooms: _Optional[_Iterable[_Union[OwnerHomestayRoom, _Mapping]]] = ..., availability: _Optional[_Iterable[_Union[OwnerHomestayAvailability, _Mapping]]] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night_minor: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night_minor: _Optional[int] = ..., license_certificate_url: _Optional[str] = ..., weekend_extra_bed_price_per_night_minor: _Optional[int] = ...) -> None: ...

class ListOwnerHomestaysResponse(_message.Message):
    __slots__ = ("homestays",)
    HOMESTAYS_FIELD_NUMBER: _ClassVar[int]
    homestays: _containers.RepeatedCompositeFieldContainer[OwnerHomestaySummary]
    def __init__(self, homestays: _Optional[_Iterable[_Union[OwnerHomestaySummary, _Mapping]]] = ...) -> None: ...

class CreateOwnerHomestayRequest(_message.Message):
    __slots__ = ("title", "slug", "tagline", "description", "property_type", "city_slug", "city", "region", "address", "map_link", "price_per_night_minor", "hero_image_url", "gallery_urls", "amenities", "house_rules", "bedrooms", "bathrooms", "max_guests", "check_in_time", "check_out_time", "submit_for_review", "extra_bed_available", "extra_bed_price_per_night_minor", "extra_beds_per_room", "weekend_price_per_night_minor", "license_certificate_url", "weekend_extra_bed_price_per_night_minor")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROPERTY_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    HOUSE_RULES_FIELD_NUMBER: _ClassVar[int]
    BEDROOMS_FIELD_NUMBER: _ClassVar[int]
    BATHROOMS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TIME_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_TIME_FIELD_NUMBER: _ClassVar[int]
    SUBMIT_FOR_REVIEW_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    LICENSE_CERTIFICATE_URL_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    title: str
    slug: str
    tagline: str
    description: str
    property_type: str
    city_slug: str
    city: str
    region: str
    address: str
    map_link: str
    price_per_night_minor: int
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    amenities: _containers.RepeatedScalarFieldContainer[str]
    house_rules: _containers.RepeatedScalarFieldContainer[str]
    bedrooms: int
    bathrooms: int
    max_guests: int
    check_in_time: str
    check_out_time: str
    submit_for_review: bool
    extra_bed_available: bool
    extra_bed_price_per_night_minor: int
    extra_beds_per_room: int
    weekend_price_per_night_minor: int
    license_certificate_url: str
    weekend_extra_bed_price_per_night_minor: int
    def __init__(self, title: _Optional[str] = ..., slug: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., property_type: _Optional[str] = ..., city_slug: _Optional[str] = ..., city: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., map_link: _Optional[str] = ..., price_per_night_minor: _Optional[int] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., amenities: _Optional[_Iterable[str]] = ..., house_rules: _Optional[_Iterable[str]] = ..., bedrooms: _Optional[int] = ..., bathrooms: _Optional[int] = ..., max_guests: _Optional[int] = ..., check_in_time: _Optional[str] = ..., check_out_time: _Optional[str] = ..., submit_for_review: _Optional[bool] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night_minor: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night_minor: _Optional[int] = ..., license_certificate_url: _Optional[str] = ..., weekend_extra_bed_price_per_night_minor: _Optional[int] = ...) -> None: ...

class UpdateOwnerHomestayRequest(_message.Message):
    __slots__ = ("title", "slug", "tagline", "description", "property_type", "city_slug", "city", "region", "address", "map_link", "price_per_night_minor", "hero_image_url", "gallery_urls", "amenities", "house_rules", "bedrooms", "bathrooms", "max_guests", "check_in_time", "check_out_time", "submit_for_review", "extra_bed_available", "extra_bed_price_per_night_minor", "extra_beds_per_room", "weekend_price_per_night_minor", "license_certificate_url", "weekend_extra_bed_price_per_night_minor")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROPERTY_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    HOUSE_RULES_FIELD_NUMBER: _ClassVar[int]
    BEDROOMS_FIELD_NUMBER: _ClassVar[int]
    BATHROOMS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TIME_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_TIME_FIELD_NUMBER: _ClassVar[int]
    SUBMIT_FOR_REVIEW_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    LICENSE_CERTIFICATE_URL_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    title: str
    slug: str
    tagline: str
    description: str
    property_type: str
    city_slug: str
    city: str
    region: str
    address: str
    map_link: str
    price_per_night_minor: int
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    amenities: _containers.RepeatedScalarFieldContainer[str]
    house_rules: _containers.RepeatedScalarFieldContainer[str]
    bedrooms: int
    bathrooms: int
    max_guests: int
    check_in_time: str
    check_out_time: str
    submit_for_review: bool
    extra_bed_available: bool
    extra_bed_price_per_night_minor: int
    extra_beds_per_room: int
    weekend_price_per_night_minor: int
    license_certificate_url: str
    weekend_extra_bed_price_per_night_minor: int
    def __init__(self, title: _Optional[str] = ..., slug: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., property_type: _Optional[str] = ..., city_slug: _Optional[str] = ..., city: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., map_link: _Optional[str] = ..., price_per_night_minor: _Optional[int] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., amenities: _Optional[_Iterable[str]] = ..., house_rules: _Optional[_Iterable[str]] = ..., bedrooms: _Optional[int] = ..., bathrooms: _Optional[int] = ..., max_guests: _Optional[int] = ..., check_in_time: _Optional[str] = ..., check_out_time: _Optional[str] = ..., submit_for_review: _Optional[bool] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night_minor: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night_minor: _Optional[int] = ..., license_certificate_url: _Optional[str] = ..., weekend_extra_bed_price_per_night_minor: _Optional[int] = ...) -> None: ...

class CreateOwnerHomestayRoomRequest(_message.Message):
    __slots__ = ("name", "category", "capacity", "price_per_night_minor", "total_units", "amenities", "sort_order", "extra_bed_available", "extra_bed_price_per_night_minor", "extra_beds_per_room", "weekend_price_per_night_minor", "weekend_extra_bed_price_per_night_minor")
    NAME_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    TOTAL_UNITS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    SORT_ORDER_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    name: str
    category: str
    capacity: int
    price_per_night_minor: int
    total_units: int
    amenities: _containers.RepeatedScalarFieldContainer[str]
    sort_order: int
    extra_bed_available: bool
    extra_bed_price_per_night_minor: int
    extra_beds_per_room: int
    weekend_price_per_night_minor: int
    weekend_extra_bed_price_per_night_minor: int
    def __init__(self, name: _Optional[str] = ..., category: _Optional[str] = ..., capacity: _Optional[int] = ..., price_per_night_minor: _Optional[int] = ..., total_units: _Optional[int] = ..., amenities: _Optional[_Iterable[str]] = ..., sort_order: _Optional[int] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night_minor: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night_minor: _Optional[int] = ..., weekend_extra_bed_price_per_night_minor: _Optional[int] = ...) -> None: ...

class UpdateOwnerHomestayRoomRequest(_message.Message):
    __slots__ = ("name", "category", "capacity", "price_per_night_minor", "total_units", "amenities", "sort_order", "is_active", "extra_bed_available", "extra_bed_price_per_night_minor", "extra_beds_per_room", "weekend_price_per_night_minor", "weekend_extra_bed_price_per_night_minor")
    NAME_FIELD_NUMBER: _ClassVar[int]
    CATEGORY_FIELD_NUMBER: _ClassVar[int]
    CAPACITY_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    TOTAL_UNITS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    SORT_ORDER_FIELD_NUMBER: _ClassVar[int]
    IS_ACTIVE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BEDS_PER_ROOM_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_EXTRA_BED_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    name: str
    category: str
    capacity: int
    price_per_night_minor: int
    total_units: int
    amenities: _containers.RepeatedScalarFieldContainer[str]
    sort_order: int
    is_active: bool
    extra_bed_available: bool
    extra_bed_price_per_night_minor: int
    extra_beds_per_room: int
    weekend_price_per_night_minor: int
    weekend_extra_bed_price_per_night_minor: int
    def __init__(self, name: _Optional[str] = ..., category: _Optional[str] = ..., capacity: _Optional[int] = ..., price_per_night_minor: _Optional[int] = ..., total_units: _Optional[int] = ..., amenities: _Optional[_Iterable[str]] = ..., sort_order: _Optional[int] = ..., is_active: _Optional[bool] = ..., extra_bed_available: _Optional[bool] = ..., extra_bed_price_per_night_minor: _Optional[int] = ..., extra_beds_per_room: _Optional[int] = ..., weekend_price_per_night_minor: _Optional[int] = ..., weekend_extra_bed_price_per_night_minor: _Optional[int] = ...) -> None: ...

class UpsertOwnerAvailabilityRequest(_message.Message):
    __slots__ = ("date", "room_id", "is_blocked", "price_override_minor", "min_nights", "note", "extra_bed_price_override_minor")
    DATE_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    IS_BLOCKED_FIELD_NUMBER: _ClassVar[int]
    PRICE_OVERRIDE_MINOR_FIELD_NUMBER: _ClassVar[int]
    MIN_NIGHTS_FIELD_NUMBER: _ClassVar[int]
    NOTE_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_PRICE_OVERRIDE_MINOR_FIELD_NUMBER: _ClassVar[int]
    date: str
    room_id: str
    is_blocked: bool
    price_override_minor: int
    min_nights: int
    note: str
    extra_bed_price_override_minor: int
    def __init__(self, date: _Optional[str] = ..., room_id: _Optional[str] = ..., is_blocked: _Optional[bool] = ..., price_override_minor: _Optional[int] = ..., min_nights: _Optional[int] = ..., note: _Optional[str] = ..., extra_bed_price_override_minor: _Optional[int] = ...) -> None: ...

class OwnerDashboardStats(_message.Message):
    __slots__ = ("pending_bookings", "confirmed_bookings", "completed_bookings", "revenue_collected_minor", "revenue_pending_minor", "upcoming_bookings", "check_in_today", "published_homestays", "currency_symbol", "total_bookings")
    PENDING_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    CONFIRMED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    COMPLETED_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    REVENUE_COLLECTED_MINOR_FIELD_NUMBER: _ClassVar[int]
    REVENUE_PENDING_MINOR_FIELD_NUMBER: _ClassVar[int]
    UPCOMING_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TODAY_FIELD_NUMBER: _ClassVar[int]
    PUBLISHED_HOMESTAYS_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    TOTAL_BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    revenue_collected_minor: int
    revenue_pending_minor: int
    upcoming_bookings: int
    check_in_today: int
    published_homestays: int
    currency_symbol: str
    total_bookings: int
    def __init__(self, pending_bookings: _Optional[int] = ..., confirmed_bookings: _Optional[int] = ..., completed_bookings: _Optional[int] = ..., revenue_collected_minor: _Optional[int] = ..., revenue_pending_minor: _Optional[int] = ..., upcoming_bookings: _Optional[int] = ..., check_in_today: _Optional[int] = ..., published_homestays: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., total_bookings: _Optional[int] = ...) -> None: ...

class HomestayBookingSummary(_message.Message):
    __slots__ = ("id", "homestay_id", "homestay_title", "homestay_slug", "room_name", "check_in", "check_out", "nights", "guest_count", "total_amount", "currency_code", "currency_symbol", "booking_status", "payment_status", "payment_method", "guest_name", "notes", "created_at", "check_in_time", "check_out_time", "homestay_address", "room_count", "extra_bed_count")
    ID_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_TITLE_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_SLUG_FIELD_NUMBER: _ClassVar[int]
    ROOM_NAME_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_FIELD_NUMBER: _ClassVar[int]
    NIGHTS_FIELD_NUMBER: _ClassVar[int]
    GUEST_COUNT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_AMOUNT_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    BOOKING_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYMENT_METHOD_FIELD_NUMBER: _ClassVar[int]
    GUEST_NAME_FIELD_NUMBER: _ClassVar[int]
    NOTES_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TIME_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_TIME_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    ROOM_COUNT_FIELD_NUMBER: _ClassVar[int]
    EXTRA_BED_COUNT_FIELD_NUMBER: _ClassVar[int]
    id: str
    homestay_id: str
    homestay_title: str
    homestay_slug: str
    room_name: str
    check_in: str
    check_out: str
    nights: int
    guest_count: int
    total_amount: int
    currency_code: str
    currency_symbol: str
    booking_status: str
    payment_status: str
    payment_method: str
    guest_name: str
    notes: str
    created_at: str
    check_in_time: str
    check_out_time: str
    homestay_address: str
    room_count: int
    extra_bed_count: int
    def __init__(self, id: _Optional[str] = ..., homestay_id: _Optional[str] = ..., homestay_title: _Optional[str] = ..., homestay_slug: _Optional[str] = ..., room_name: _Optional[str] = ..., check_in: _Optional[str] = ..., check_out: _Optional[str] = ..., nights: _Optional[int] = ..., guest_count: _Optional[int] = ..., total_amount: _Optional[int] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., booking_status: _Optional[str] = ..., payment_status: _Optional[str] = ..., payment_method: _Optional[str] = ..., guest_name: _Optional[str] = ..., notes: _Optional[str] = ..., created_at: _Optional[str] = ..., check_in_time: _Optional[str] = ..., check_out_time: _Optional[str] = ..., homestay_address: _Optional[str] = ..., room_count: _Optional[int] = ..., extra_bed_count: _Optional[int] = ...) -> None: ...

class ListHomestayBookingsResponse(_message.Message):
    __slots__ = ("bookings",)
    BOOKINGS_FIELD_NUMBER: _ClassVar[int]
    bookings: _containers.RepeatedCompositeFieldContainer[HomestayBookingSummary]
    def __init__(self, bookings: _Optional[_Iterable[_Union[HomestayBookingSummary, _Mapping]]] = ...) -> None: ...

class AdminHomestaySummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "status", "owner_name", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    OWNER_NAME_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    status: str
    owner_name: str
    created_at: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., status: _Optional[str] = ..., owner_name: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class AdminHomestayDetail(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "property_type", "city", "city_slug", "region", "address", "map_link", "price_per_night_minor", "status", "hero_image_url", "gallery_urls", "amenities", "house_rules", "bedrooms", "bathrooms", "max_guests", "check_in_time", "check_out_time", "currency_code", "currency_symbol", "rooms", "created_at", "updated_at", "owner_name", "owner_email", "owner_phone", "owner_verified", "weekend_price_per_night_minor", "license_certificate_url")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROPERTY_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    MAP_LINK_FIELD_NUMBER: _ClassVar[int]
    PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    AMENITIES_FIELD_NUMBER: _ClassVar[int]
    HOUSE_RULES_FIELD_NUMBER: _ClassVar[int]
    BEDROOMS_FIELD_NUMBER: _ClassVar[int]
    BATHROOMS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CHECK_IN_TIME_FIELD_NUMBER: _ClassVar[int]
    CHECK_OUT_TIME_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    ROOMS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    OWNER_NAME_FIELD_NUMBER: _ClassVar[int]
    OWNER_EMAIL_FIELD_NUMBER: _ClassVar[int]
    OWNER_PHONE_FIELD_NUMBER: _ClassVar[int]
    OWNER_VERIFIED_FIELD_NUMBER: _ClassVar[int]
    WEEKEND_PRICE_PER_NIGHT_MINOR_FIELD_NUMBER: _ClassVar[int]
    LICENSE_CERTIFICATE_URL_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    property_type: str
    city: str
    city_slug: str
    region: str
    address: str
    map_link: str
    price_per_night_minor: int
    status: str
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    amenities: _containers.RepeatedScalarFieldContainer[str]
    house_rules: _containers.RepeatedScalarFieldContainer[str]
    bedrooms: int
    bathrooms: int
    max_guests: int
    check_in_time: str
    check_out_time: str
    currency_code: str
    currency_symbol: str
    rooms: _containers.RepeatedCompositeFieldContainer[OwnerHomestayRoom]
    created_at: str
    updated_at: str
    owner_name: str
    owner_email: str
    owner_phone: str
    owner_verified: bool
    weekend_price_per_night_minor: int
    license_certificate_url: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., property_type: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., region: _Optional[str] = ..., address: _Optional[str] = ..., map_link: _Optional[str] = ..., price_per_night_minor: _Optional[int] = ..., status: _Optional[str] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., amenities: _Optional[_Iterable[str]] = ..., house_rules: _Optional[_Iterable[str]] = ..., bedrooms: _Optional[int] = ..., bathrooms: _Optional[int] = ..., max_guests: _Optional[int] = ..., check_in_time: _Optional[str] = ..., check_out_time: _Optional[str] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., rooms: _Optional[_Iterable[_Union[OwnerHomestayRoom, _Mapping]]] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., owner_name: _Optional[str] = ..., owner_email: _Optional[str] = ..., owner_phone: _Optional[str] = ..., owner_verified: _Optional[bool] = ..., weekend_price_per_night_minor: _Optional[int] = ..., license_certificate_url: _Optional[str] = ...) -> None: ...

class ListAdminHomestaysResponse(_message.Message):
    __slots__ = ("homestays",)
    HOMESTAYS_FIELD_NUMBER: _ClassVar[int]
    homestays: _containers.RepeatedCompositeFieldContainer[AdminHomestaySummary]
    def __init__(self, homestays: _Optional[_Iterable[_Union[AdminHomestaySummary, _Mapping]]] = ...) -> None: ...

class AdminVipPackageSummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "status", "owner_name", "created_at", "package_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    OWNER_NAME_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    status: str
    owner_name: str
    created_at: str
    package_type: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., status: _Optional[str] = ..., owner_name: _Optional[str] = ..., created_at: _Optional[str] = ..., package_type: _Optional[str] = ...) -> None: ...

class AdminVipPackageDetail(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "package_type", "city", "city_slug", "region", "price_from_minor", "status", "hero_image_url", "gallery_urls", "highlights", "concierge_note", "duration_days", "max_guests", "currency_code", "currency_symbol", "created_at", "updated_at", "owner_name", "owner_email", "owner_phone", "owner_verified")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FROM_MINOR_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    HIGHLIGHTS_FIELD_NUMBER: _ClassVar[int]
    CONCIERGE_NOTE_FIELD_NUMBER: _ClassVar[int]
    DURATION_DAYS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    OWNER_NAME_FIELD_NUMBER: _ClassVar[int]
    OWNER_EMAIL_FIELD_NUMBER: _ClassVar[int]
    OWNER_PHONE_FIELD_NUMBER: _ClassVar[int]
    OWNER_VERIFIED_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    package_type: str
    city: str
    city_slug: str
    region: str
    price_from_minor: int
    status: str
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    highlights: _containers.RepeatedScalarFieldContainer[str]
    concierge_note: str
    duration_days: int
    max_guests: int
    currency_code: str
    currency_symbol: str
    created_at: str
    updated_at: str
    owner_name: str
    owner_email: str
    owner_phone: str
    owner_verified: bool
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., package_type: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., region: _Optional[str] = ..., price_from_minor: _Optional[int] = ..., status: _Optional[str] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., highlights: _Optional[_Iterable[str]] = ..., concierge_note: _Optional[str] = ..., duration_days: _Optional[int] = ..., max_guests: _Optional[int] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ..., owner_name: _Optional[str] = ..., owner_email: _Optional[str] = ..., owner_phone: _Optional[str] = ..., owner_verified: _Optional[bool] = ...) -> None: ...

class ListAdminVipPackagesResponse(_message.Message):
    __slots__ = ("packages",)
    PACKAGES_FIELD_NUMBER: _ClassVar[int]
    packages: _containers.RepeatedCompositeFieldContainer[AdminVipPackageSummary]
    def __init__(self, packages: _Optional[_Iterable[_Union[AdminVipPackageSummary, _Mapping]]] = ...) -> None: ...

class OwnerVipPackageSummary(_message.Message):
    __slots__ = ("id", "slug", "title", "city", "status", "price_from_minor", "currency_symbol", "duration_days", "image", "package_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    PRICE_FROM_MINOR_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    DURATION_DAYS_FIELD_NUMBER: _ClassVar[int]
    IMAGE_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    city: str
    status: str
    price_from_minor: int
    currency_symbol: str
    duration_days: int
    image: str
    package_type: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., city: _Optional[str] = ..., status: _Optional[str] = ..., price_from_minor: _Optional[int] = ..., currency_symbol: _Optional[str] = ..., duration_days: _Optional[int] = ..., image: _Optional[str] = ..., package_type: _Optional[str] = ...) -> None: ...

class OwnerVipPackageDetail(_message.Message):
    __slots__ = ("id", "slug", "title", "tagline", "description", "package_type", "city", "city_slug", "region", "price_from_minor", "status", "hero_image_url", "gallery_urls", "highlights", "concierge_note", "duration_days", "max_guests", "currency_code", "currency_symbol", "created_at", "updated_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FROM_MINOR_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    HIGHLIGHTS_FIELD_NUMBER: _ClassVar[int]
    CONCIERGE_NOTE_FIELD_NUMBER: _ClassVar[int]
    DURATION_DAYS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_CODE_FIELD_NUMBER: _ClassVar[int]
    CURRENCY_SYMBOL_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    slug: str
    title: str
    tagline: str
    description: str
    package_type: str
    city: str
    city_slug: str
    region: str
    price_from_minor: int
    status: str
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    highlights: _containers.RepeatedScalarFieldContainer[str]
    concierge_note: str
    duration_days: int
    max_guests: int
    currency_code: str
    currency_symbol: str
    created_at: str
    updated_at: str
    def __init__(self, id: _Optional[str] = ..., slug: _Optional[str] = ..., title: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., package_type: _Optional[str] = ..., city: _Optional[str] = ..., city_slug: _Optional[str] = ..., region: _Optional[str] = ..., price_from_minor: _Optional[int] = ..., status: _Optional[str] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., highlights: _Optional[_Iterable[str]] = ..., concierge_note: _Optional[str] = ..., duration_days: _Optional[int] = ..., max_guests: _Optional[int] = ..., currency_code: _Optional[str] = ..., currency_symbol: _Optional[str] = ..., created_at: _Optional[str] = ..., updated_at: _Optional[str] = ...) -> None: ...

class ListOwnerVipPackagesResponse(_message.Message):
    __slots__ = ("packages",)
    PACKAGES_FIELD_NUMBER: _ClassVar[int]
    packages: _containers.RepeatedCompositeFieldContainer[OwnerVipPackageSummary]
    def __init__(self, packages: _Optional[_Iterable[_Union[OwnerVipPackageSummary, _Mapping]]] = ...) -> None: ...

class CreateOwnerVipPackageRequest(_message.Message):
    __slots__ = ("title", "slug", "tagline", "description", "package_type", "city_slug", "city", "region", "price_from_minor", "hero_image_url", "gallery_urls", "highlights", "concierge_note", "duration_days", "max_guests", "submit_for_review")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FROM_MINOR_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    HIGHLIGHTS_FIELD_NUMBER: _ClassVar[int]
    CONCIERGE_NOTE_FIELD_NUMBER: _ClassVar[int]
    DURATION_DAYS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    SUBMIT_FOR_REVIEW_FIELD_NUMBER: _ClassVar[int]
    title: str
    slug: str
    tagline: str
    description: str
    package_type: str
    city_slug: str
    city: str
    region: str
    price_from_minor: int
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    highlights: _containers.RepeatedScalarFieldContainer[str]
    concierge_note: str
    duration_days: int
    max_guests: int
    submit_for_review: bool
    def __init__(self, title: _Optional[str] = ..., slug: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., package_type: _Optional[str] = ..., city_slug: _Optional[str] = ..., city: _Optional[str] = ..., region: _Optional[str] = ..., price_from_minor: _Optional[int] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., highlights: _Optional[_Iterable[str]] = ..., concierge_note: _Optional[str] = ..., duration_days: _Optional[int] = ..., max_guests: _Optional[int] = ..., submit_for_review: _Optional[bool] = ...) -> None: ...

class UpdateOwnerVipPackageRequest(_message.Message):
    __slots__ = ("title", "slug", "tagline", "description", "package_type", "city_slug", "city", "region", "price_from_minor", "hero_image_url", "gallery_urls", "highlights", "concierge_note", "duration_days", "max_guests", "submit_for_review")
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SLUG_FIELD_NUMBER: _ClassVar[int]
    TAGLINE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    CITY_FIELD_NUMBER: _ClassVar[int]
    REGION_FIELD_NUMBER: _ClassVar[int]
    PRICE_FROM_MINOR_FIELD_NUMBER: _ClassVar[int]
    HERO_IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    GALLERY_URLS_FIELD_NUMBER: _ClassVar[int]
    HIGHLIGHTS_FIELD_NUMBER: _ClassVar[int]
    CONCIERGE_NOTE_FIELD_NUMBER: _ClassVar[int]
    DURATION_DAYS_FIELD_NUMBER: _ClassVar[int]
    MAX_GUESTS_FIELD_NUMBER: _ClassVar[int]
    SUBMIT_FOR_REVIEW_FIELD_NUMBER: _ClassVar[int]
    title: str
    slug: str
    tagline: str
    description: str
    package_type: str
    city_slug: str
    city: str
    region: str
    price_from_minor: int
    hero_image_url: str
    gallery_urls: _containers.RepeatedScalarFieldContainer[str]
    highlights: _containers.RepeatedScalarFieldContainer[str]
    concierge_note: str
    duration_days: int
    max_guests: int
    submit_for_review: bool
    def __init__(self, title: _Optional[str] = ..., slug: _Optional[str] = ..., tagline: _Optional[str] = ..., description: _Optional[str] = ..., package_type: _Optional[str] = ..., city_slug: _Optional[str] = ..., city: _Optional[str] = ..., region: _Optional[str] = ..., price_from_minor: _Optional[int] = ..., hero_image_url: _Optional[str] = ..., gallery_urls: _Optional[_Iterable[str]] = ..., highlights: _Optional[_Iterable[str]] = ..., concierge_note: _Optional[str] = ..., duration_days: _Optional[int] = ..., max_guests: _Optional[int] = ..., submit_for_review: _Optional[bool] = ...) -> None: ...

class SubmitVipMembershipApplicationRequest(_message.Message):
    __slots__ = ("full_name", "email", "phone", "address", "id_document_number", "id_document_photo_url", "description", "professional_card_type", "professional_card_photo_url", "instagram_username", "facebook_username")
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_NUMBER_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_PHOTO_URL_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROFESSIONAL_CARD_TYPE_FIELD_NUMBER: _ClassVar[int]
    PROFESSIONAL_CARD_PHOTO_URL_FIELD_NUMBER: _ClassVar[int]
    INSTAGRAM_USERNAME_FIELD_NUMBER: _ClassVar[int]
    FACEBOOK_USERNAME_FIELD_NUMBER: _ClassVar[int]
    full_name: str
    email: str
    phone: str
    address: str
    id_document_number: str
    id_document_photo_url: str
    description: str
    professional_card_type: str
    professional_card_photo_url: str
    instagram_username: str
    facebook_username: str
    def __init__(self, full_name: _Optional[str] = ..., email: _Optional[str] = ..., phone: _Optional[str] = ..., address: _Optional[str] = ..., id_document_number: _Optional[str] = ..., id_document_photo_url: _Optional[str] = ..., description: _Optional[str] = ..., professional_card_type: _Optional[str] = ..., professional_card_photo_url: _Optional[str] = ..., instagram_username: _Optional[str] = ..., facebook_username: _Optional[str] = ...) -> None: ...

class VipMembershipApplicationSummary(_message.Message):
    __slots__ = ("id", "guest_user_id", "full_name", "email", "phone", "id_document_type", "status", "created_at", "id_document_photo_url", "description", "professional_card_type", "professional_card_photo_url", "instagram_username", "facebook_username")
    ID_FIELD_NUMBER: _ClassVar[int]
    GUEST_USER_ID_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_PHOTO_URL_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROFESSIONAL_CARD_TYPE_FIELD_NUMBER: _ClassVar[int]
    PROFESSIONAL_CARD_PHOTO_URL_FIELD_NUMBER: _ClassVar[int]
    INSTAGRAM_USERNAME_FIELD_NUMBER: _ClassVar[int]
    FACEBOOK_USERNAME_FIELD_NUMBER: _ClassVar[int]
    id: str
    guest_user_id: str
    full_name: str
    email: str
    phone: str
    id_document_type: str
    status: str
    created_at: str
    id_document_photo_url: str
    description: str
    professional_card_type: str
    professional_card_photo_url: str
    instagram_username: str
    facebook_username: str
    def __init__(self, id: _Optional[str] = ..., guest_user_id: _Optional[str] = ..., full_name: _Optional[str] = ..., email: _Optional[str] = ..., phone: _Optional[str] = ..., id_document_type: _Optional[str] = ..., status: _Optional[str] = ..., created_at: _Optional[str] = ..., id_document_photo_url: _Optional[str] = ..., description: _Optional[str] = ..., professional_card_type: _Optional[str] = ..., professional_card_photo_url: _Optional[str] = ..., instagram_username: _Optional[str] = ..., facebook_username: _Optional[str] = ...) -> None: ...

class VipMembershipApplicationDetail(_message.Message):
    __slots__ = ("id", "guest_user_id", "full_name", "email", "phone", "address", "id_document_type", "id_document_number", "status", "created_at", "id_document_photo_url", "description", "professional_card_type", "professional_card_photo_url", "instagram_username", "facebook_username")
    ID_FIELD_NUMBER: _ClassVar[int]
    GUEST_USER_ID_FIELD_NUMBER: _ClassVar[int]
    FULL_NAME_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PHONE_FIELD_NUMBER: _ClassVar[int]
    ADDRESS_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_NUMBER_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    ID_DOCUMENT_PHOTO_URL_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    PROFESSIONAL_CARD_TYPE_FIELD_NUMBER: _ClassVar[int]
    PROFESSIONAL_CARD_PHOTO_URL_FIELD_NUMBER: _ClassVar[int]
    INSTAGRAM_USERNAME_FIELD_NUMBER: _ClassVar[int]
    FACEBOOK_USERNAME_FIELD_NUMBER: _ClassVar[int]
    id: str
    guest_user_id: str
    full_name: str
    email: str
    phone: str
    address: str
    id_document_type: str
    id_document_number: str
    status: str
    created_at: str
    id_document_photo_url: str
    description: str
    professional_card_type: str
    professional_card_photo_url: str
    instagram_username: str
    facebook_username: str
    def __init__(self, id: _Optional[str] = ..., guest_user_id: _Optional[str] = ..., full_name: _Optional[str] = ..., email: _Optional[str] = ..., phone: _Optional[str] = ..., address: _Optional[str] = ..., id_document_type: _Optional[str] = ..., id_document_number: _Optional[str] = ..., status: _Optional[str] = ..., created_at: _Optional[str] = ..., id_document_photo_url: _Optional[str] = ..., description: _Optional[str] = ..., professional_card_type: _Optional[str] = ..., professional_card_photo_url: _Optional[str] = ..., instagram_username: _Optional[str] = ..., facebook_username: _Optional[str] = ...) -> None: ...

class ListVipMembershipApplicationsResponse(_message.Message):
    __slots__ = ("applications",)
    APPLICATIONS_FIELD_NUMBER: _ClassVar[int]
    applications: _containers.RepeatedCompositeFieldContainer[VipMembershipApplicationSummary]
    def __init__(self, applications: _Optional[_Iterable[_Union[VipMembershipApplicationSummary, _Mapping]]] = ...) -> None: ...

class VipMembershipActionRequest(_message.Message):
    __slots__ = ("application_id",)
    APPLICATION_ID_FIELD_NUMBER: _ClassVar[int]
    application_id: str
    def __init__(self, application_id: _Optional[str] = ...) -> None: ...

class CreateVipCustomPackageRequest(_message.Message):
    __slots__ = ("travel_start", "travel_end", "guest_count", "preferences", "guest_phone")
    TRAVEL_START_FIELD_NUMBER: _ClassVar[int]
    TRAVEL_END_FIELD_NUMBER: _ClassVar[int]
    GUEST_COUNT_FIELD_NUMBER: _ClassVar[int]
    PREFERENCES_FIELD_NUMBER: _ClassVar[int]
    GUEST_PHONE_FIELD_NUMBER: _ClassVar[int]
    travel_start: str
    travel_end: str
    guest_count: int
    preferences: str
    guest_phone: str
    def __init__(self, travel_start: _Optional[str] = ..., travel_end: _Optional[str] = ..., guest_count: _Optional[int] = ..., preferences: _Optional[str] = ..., guest_phone: _Optional[str] = ...) -> None: ...

class VipCustomPackageRequestSummary(_message.Message):
    __slots__ = ("id", "guest_user_id", "guest_name", "guest_email", "guest_phone", "travel_start", "travel_end", "guest_count", "preferences", "status", "created_at")
    ID_FIELD_NUMBER: _ClassVar[int]
    GUEST_USER_ID_FIELD_NUMBER: _ClassVar[int]
    GUEST_NAME_FIELD_NUMBER: _ClassVar[int]
    GUEST_EMAIL_FIELD_NUMBER: _ClassVar[int]
    GUEST_PHONE_FIELD_NUMBER: _ClassVar[int]
    TRAVEL_START_FIELD_NUMBER: _ClassVar[int]
    TRAVEL_END_FIELD_NUMBER: _ClassVar[int]
    GUEST_COUNT_FIELD_NUMBER: _ClassVar[int]
    PREFERENCES_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    id: str
    guest_user_id: str
    guest_name: str
    guest_email: str
    guest_phone: str
    travel_start: str
    travel_end: str
    guest_count: int
    preferences: str
    status: str
    created_at: str
    def __init__(self, id: _Optional[str] = ..., guest_user_id: _Optional[str] = ..., guest_name: _Optional[str] = ..., guest_email: _Optional[str] = ..., guest_phone: _Optional[str] = ..., travel_start: _Optional[str] = ..., travel_end: _Optional[str] = ..., guest_count: _Optional[int] = ..., preferences: _Optional[str] = ..., status: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class ListVipCustomPackageRequestsResponse(_message.Message):
    __slots__ = ("requests",)
    REQUESTS_FIELD_NUMBER: _ClassVar[int]
    requests: _containers.RepeatedCompositeFieldContainer[VipCustomPackageRequestSummary]
    def __init__(self, requests: _Optional[_Iterable[_Union[VipCustomPackageRequestSummary, _Mapping]]] = ...) -> None: ...
