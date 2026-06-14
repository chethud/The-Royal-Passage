from __future__ import annotations

from functools import wraps
from typing import Callable, TypeVar

import google.protobuf.empty_pb2 as empty_pb2
import royalpassage.v1.service_pb2 as service_pb2
import royalpassage.v1.types_pb2 as types_pb2
from connectrpc.code import Code
from connectrpc.errors import ConnectError
from connectrpc.request import RequestContext
from royalpassage.v1.service_connect import RoyalPassageService

from app.config import settings
from app.models import schemas as s
from app.rpc.auth import require_admin, require_guest, require_host, resolve_current_user
from app.rpc.converters import proto_to_pydantic, pydantic_to_proto
from app.services.admin_analytics import get_admin_stats, list_admin_activity, list_admin_bookings
from app.services.admin_experiences import (
    get_admin_experience,
    list_pending_experiences,
    publish_experience,
    reject_experience,
)
from app.services.admin_users import create_host_account, list_managed_users
from app.services.audit import log_audit
from app.services.bookings import cancel_guest_booking, create_cod_booking, get_booking_by_id, list_guest_bookings
from app.services.cities import get_city_by_slug, list_active_cities
from app.services.guest_profile import get_guest_profile, update_guest_profile
from app.services.host_bookings import (
    complete_host_booking,
    confirm_host_booking,
    get_host_booking_by_id,
    get_host_dashboard,
    get_host_revenue,
    list_host_bookings,
    list_host_reviews,
    mark_host_booking_paid,
    pause_host_booking,
    reject_host_booking,
    resume_host_booking,
)
from app.services.host_experiences import (
    create_host_experience,
    create_host_slot,
    delete_host_experience,
    delete_host_slot,
    get_host_experience,
    list_categories,
    list_host_experiences,
    update_host_experience,
    update_host_slot,
)
from app.services.marketplace import get_catalog, get_experience_detail
from app.services.notifications import (
    list_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
)
from app.services.reviews import (
    create_review,
    hide_review,
    host_reply_to_review,
    list_admin_reviews,
    list_experience_reviews,
)
from app.services.wishlist import add_to_wishlist, list_wishlist, remove_from_wishlist

F = TypeVar("F", bound=Callable)


def _ensure_supabase() -> None:
    if not settings.supabase_configured:
        raise ConnectError(Code.UNAVAILABLE, "Supabase is not configured on the API server.")


def _rpc(fn: F) -> F:
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except ConnectError:
            raise
        except ValueError as exc:
            raise ConnectError(Code.INVALID_ARGUMENT, str(exc)) from exc

    return wrapper  # type: ignore[return-value]


class RoyalPassageServiceImpl(RoyalPassageService):
    @_rpc
    async def health_check(self, _request: empty_pb2.Empty, _ctx: RequestContext) -> types_pb2.HealthResponse:
        return types_pb2.HealthResponse(status="ok")

    @_rpc
    async def list_cities(self, _request: empty_pb2.Empty, _ctx: RequestContext) -> types_pb2.ListCitiesResponse:
        _ensure_supabase()
        cities = list_active_cities()
        return types_pb2.ListCitiesResponse(cities=[pydantic_to_proto(c, types_pb2.CitySummary) for c in cities])

    @_rpc
    async def get_city(self, request: service_pb2.GetCityRequest, _ctx: RequestContext) -> types_pb2.CitySummary:
        _ensure_supabase()
        city = get_city_by_slug(request.slug)
        if not city:
            raise ConnectError(Code.NOT_FOUND, "City not found.")
        return pydantic_to_proto(city, types_pb2.CitySummary)

    @_rpc
    async def get_catalog(self, request: service_pb2.GetCatalogRequest, _ctx: RequestContext) -> types_pb2.CatalogResponse:
        _ensure_supabase()
        city_slug = request.city_slug if request.HasField("city_slug") else None
        return pydantic_to_proto(get_catalog(city_slug), types_pb2.CatalogResponse)

    @_rpc
    async def get_experience_by_slug(
        self, request: service_pb2.GetExperienceBySlugRequest, _ctx: RequestContext
    ) -> types_pb2.ExperienceDetailResponse:
        _ensure_supabase()
        detail = get_experience_detail(request.slug)
        if not detail:
            raise ConnectError(Code.NOT_FOUND, "Experience not found.")
        return pydantic_to_proto(detail, types_pb2.ExperienceDetailResponse)

    @_rpc
    async def create_booking(
        self, request: types_pb2.CreateBookingRequest, ctx: RequestContext
    ) -> types_pb2.CreateBookingResponse:
        _ensure_supabase()
        auth = require_guest(ctx)
        payload = proto_to_pydantic(request, s.CreateBookingRequest)
        return pydantic_to_proto(create_cod_booking(payload, auth), types_pb2.CreateBookingResponse)

    @_rpc
    async def list_my_bookings(
        self, request: service_pb2.ListMyBookingsRequest, ctx: RequestContext
    ) -> types_pb2.ListBookingsResponse:
        _ensure_supabase()
        auth = require_guest(ctx)
        status = request.status if request.HasField("status") else None
        bookings = list_guest_bookings(auth, status)
        return types_pb2.ListBookingsResponse(
            bookings=[pydantic_to_proto(b, types_pb2.BookingSummary) for b in bookings]
        )

    @_rpc
    async def get_booking(
        self, request: service_pb2.GetBookingRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = resolve_current_user(ctx)
        try:
            return pydantic_to_proto(get_booking_by_id(request.booking_id, auth), types_pb2.BookingSummary)
        except ValueError as exc:
            msg = str(exc)
            code = Code.PERMISSION_DENIED if "access" in msg.lower() else Code.NOT_FOUND
            raise ConnectError(code, msg) from exc

    @_rpc
    async def cancel_booking(
        self, request: service_pb2.CancelBookingRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_guest(ctx)
        return pydantic_to_proto(cancel_guest_booking(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def get_guest_profile(self, _request: empty_pb2.Empty, ctx: RequestContext) -> types_pb2.GuestProfile:
        _ensure_supabase()
        auth = resolve_current_user(ctx)
        return pydantic_to_proto(get_guest_profile(auth), types_pb2.GuestProfile)

    @_rpc
    async def update_guest_profile(
        self, request: types_pb2.UpdateGuestProfileRequest, ctx: RequestContext
    ) -> types_pb2.GuestProfile:
        _ensure_supabase()
        auth = resolve_current_user(ctx)
        payload = proto_to_pydantic(request, s.UpdateGuestProfileRequest)
        return pydantic_to_proto(update_guest_profile(auth, payload), types_pb2.GuestProfile)

    @_rpc
    async def list_wishlist(self, _request: empty_pb2.Empty, ctx: RequestContext) -> types_pb2.ListWishlistResponse:
        _ensure_supabase()
        auth = require_guest(ctx)
        items = list_wishlist(auth)
        return types_pb2.ListWishlistResponse(
            items=[pydantic_to_proto(item, types_pb2.WishlistItem) for item in items]
        )

    @_rpc
    async def add_to_wishlist(
        self, request: service_pb2.AddToWishlistRequest, ctx: RequestContext
    ) -> types_pb2.WishlistItem:
        _ensure_supabase()
        auth = require_guest(ctx)
        return pydantic_to_proto(add_to_wishlist(auth, request.experience_id), types_pb2.WishlistItem)

    @_rpc
    async def remove_from_wishlist(
        self, request: service_pb2.RemoveFromWishlistRequest, ctx: RequestContext
    ) -> types_pb2.OkResponse:
        _ensure_supabase()
        auth = require_guest(ctx)
        remove_from_wishlist(auth, request.experience_id)
        return types_pb2.OkResponse(ok=True)

    @_rpc
    async def get_host_dashboard(self, _request: empty_pb2.Empty, ctx: RequestContext) -> types_pb2.HostDashboardStats:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(get_host_dashboard(auth), types_pb2.HostDashboardStats)

    @_rpc
    async def list_host_bookings(
        self, request: service_pb2.ListHostBookingsRequest, ctx: RequestContext
    ) -> types_pb2.ListBookingsResponse:
        _ensure_supabase()
        auth = require_host(ctx)
        status = request.status if request.HasField("status") else None
        bookings = list_host_bookings(auth, status)
        return types_pb2.ListBookingsResponse(
            bookings=[pydantic_to_proto(b, types_pb2.BookingSummary) for b in bookings]
        )

    @_rpc
    async def get_host_booking(
        self, request: service_pb2.GetHostBookingRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(get_host_booking_by_id(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def get_host_revenue(self, _request: empty_pb2.Empty, ctx: RequestContext) -> types_pb2.HostRevenueSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(get_host_revenue(auth), types_pb2.HostRevenueSummary)

    @_rpc
    async def list_host_reviews(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListHostReviewsResponse:
        _ensure_supabase()
        auth = require_host(ctx)
        reviews = list_host_reviews(auth)
        return types_pb2.ListHostReviewsResponse(
            reviews=[pydantic_to_proto(r, types_pb2.HostReviewSummary) for r in reviews]
        )

    @_rpc
    async def list_host_categories(
        self, _request: empty_pb2.Empty, _ctx: RequestContext
    ) -> types_pb2.ListHostCategoriesResponse:
        _ensure_supabase()
        categories = list_categories()
        return types_pb2.ListHostCategoriesResponse(
            categories=[pydantic_to_proto(c, types_pb2.CategoryOption) for c in categories]
        )

    @_rpc
    async def list_host_experiences(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListHostExperiencesResponse:
        _ensure_supabase()
        auth = require_host(ctx)
        experiences = list_host_experiences(auth)
        return types_pb2.ListHostExperiencesResponse(
            experiences=[pydantic_to_proto(e, types_pb2.HostExperienceSummary) for e in experiences]
        )

    @_rpc
    async def create_host_experience(
        self, request: types_pb2.CreateHostExperienceRequest, ctx: RequestContext
    ) -> types_pb2.HostExperienceDetail:
        _ensure_supabase()
        auth = require_host(ctx)
        payload = proto_to_pydantic(request, s.CreateHostExperienceRequest)
        return pydantic_to_proto(create_host_experience(auth, payload), types_pb2.HostExperienceDetail)

    @_rpc
    async def get_host_experience(
        self, request: service_pb2.GetHostExperienceRequest, ctx: RequestContext
    ) -> types_pb2.HostExperienceDetail:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(get_host_experience(auth, request.experience_id), types_pb2.HostExperienceDetail)

    @_rpc
    async def update_host_experience(
        self, request: service_pb2.UpdateHostExperienceInput, ctx: RequestContext
    ) -> types_pb2.HostExperienceDetail:
        _ensure_supabase()
        auth = require_host(ctx)
        payload = proto_to_pydantic(request.experience, s.UpdateHostExperienceRequest)
        return pydantic_to_proto(
            update_host_experience(auth, request.experience_id, payload), types_pb2.HostExperienceDetail
        )

    @_rpc
    async def delete_host_experience(
        self, request: service_pb2.DeleteHostExperienceRequest, ctx: RequestContext
    ) -> types_pb2.OkResponse:
        _ensure_supabase()
        auth = require_host(ctx)
        delete_host_experience(auth, request.experience_id)
        return types_pb2.OkResponse(ok=True)

    @_rpc
    async def create_host_slot(
        self, request: service_pb2.CreateHostSlotInput, ctx: RequestContext
    ) -> types_pb2.HostExperienceDetail:
        _ensure_supabase()
        auth = require_host(ctx)
        payload = proto_to_pydantic(request.slot, s.CreateHostSlotRequest)
        return pydantic_to_proto(
            create_host_slot(auth, request.experience_id, payload), types_pb2.HostExperienceDetail
        )

    @_rpc
    async def update_host_slot(
        self, request: service_pb2.UpdateHostSlotInput, ctx: RequestContext
    ) -> types_pb2.HostExperienceDetail:
        _ensure_supabase()
        auth = require_host(ctx)
        payload = proto_to_pydantic(request.slot, s.UpdateHostSlotRequest)
        return pydantic_to_proto(
            update_host_slot(auth, request.experience_id, request.slot_id, payload),
            types_pb2.HostExperienceDetail,
        )

    @_rpc
    async def delete_host_slot(
        self, request: service_pb2.DeleteHostSlotRequest, ctx: RequestContext
    ) -> types_pb2.HostExperienceDetail:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(
            delete_host_slot(auth, request.experience_id, request.slot_id), types_pb2.HostExperienceDetail
        )

    @_rpc
    async def confirm_host_booking(
        self, request: service_pb2.HostBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(confirm_host_booking(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def reject_host_booking(
        self, request: service_pb2.HostBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(reject_host_booking(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def mark_host_booking_paid(
        self, request: service_pb2.HostBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(mark_host_booking_paid(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def complete_host_booking(
        self, request: service_pb2.HostBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(complete_host_booking(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def pause_host_booking(
        self, request: service_pb2.HostBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(pause_host_booking(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def resume_host_booking(
        self, request: service_pb2.HostBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.BookingSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        return pydantic_to_proto(resume_host_booking(request.booking_id, auth), types_pb2.BookingSummary)

    @_rpc
    async def get_admin_stats(self, _request: empty_pb2.Empty, _ctx: RequestContext) -> types_pb2.AdminStats:
        _ensure_supabase()
        require_admin(_ctx)
        return pydantic_to_proto(get_admin_stats(), types_pb2.AdminStats)

    @_rpc
    async def list_admin_bookings(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminBookingsResponse:
        _ensure_supabase()
        require_admin(ctx)
        bookings = list_admin_bookings()
        return types_pb2.ListAdminBookingsResponse(
            bookings=[pydantic_to_proto(b, types_pb2.AdminBookingRow) for b in bookings]
        )

    @_rpc
    async def list_admin_activity(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminActivityResponse:
        _ensure_supabase()
        require_admin(ctx)
        entries = list_admin_activity()
        return types_pb2.ListAdminActivityResponse(
            entries=[pydantic_to_proto(e, types_pb2.AuditLogEntry) for e in entries]
        )

    @_rpc
    async def list_admin_users(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminUsersResponse:
        _ensure_supabase()
        require_admin(ctx)
        users = list_managed_users()
        return types_pb2.ListAdminUsersResponse(
            users=[pydantic_to_proto(u, types_pb2.ManagedUser) for u in users]
        )

    @_rpc
    async def create_host(
        self, request: types_pb2.CreateHostRequest, ctx: RequestContext
    ) -> types_pb2.CreateHostResponse:
        _ensure_supabase()
        require_admin(ctx)
        payload = proto_to_pydantic(request, s.CreateHostRequest)
        return pydantic_to_proto(create_host_account(payload), types_pb2.CreateHostResponse)

    @_rpc
    async def list_admin_experiences(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminExperiencesResponse:
        _ensure_supabase()
        require_admin(ctx)
        experiences = list_pending_experiences()
        return types_pb2.ListAdminExperiencesResponse(
            experiences=[pydantic_to_proto(e, types_pb2.AdminExperienceSummary) for e in experiences]
        )

    @_rpc
    async def get_admin_experience(
        self, request: service_pb2.AdminExperienceActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminExperienceDetail:
        _ensure_supabase()
        require_admin(ctx)
        detail = get_admin_experience(request.experience_id)
        return pydantic_to_proto(detail, types_pb2.AdminExperienceDetail)

    @_rpc
    async def publish_experience(
        self, request: service_pb2.AdminExperienceActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminExperienceSummary:
        _ensure_supabase()
        auth = require_admin(ctx)
        result = publish_experience(request.experience_id)
        log_audit(auth["user"].id, "experience_published", "experience", request.experience_id, {})
        return pydantic_to_proto(result, types_pb2.AdminExperienceSummary)

    @_rpc
    async def reject_experience(
        self, request: service_pb2.AdminExperienceActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminExperienceSummary:
        _ensure_supabase()
        require_admin(ctx)
        return pydantic_to_proto(reject_experience(request.experience_id), types_pb2.AdminExperienceSummary)

    @_rpc
    async def list_experience_reviews(
        self, request: service_pb2.ListExperienceReviewsRequest, _ctx: RequestContext
    ) -> types_pb2.ListExperienceReviewsResponse:
        _ensure_supabase()
        reviews = list_experience_reviews(request.slug)
        return types_pb2.ListExperienceReviewsResponse(
            reviews=[pydantic_to_proto(r, types_pb2.ReviewSummary) for r in reviews]
        )

    @_rpc
    async def create_review(
        self, request: types_pb2.CreateReviewRequest, ctx: RequestContext
    ) -> types_pb2.ReviewSummary:
        _ensure_supabase()
        auth = require_guest(ctx)
        payload = proto_to_pydantic(request, s.CreateReviewRequest)
        return pydantic_to_proto(create_review(auth, payload), types_pb2.ReviewSummary)

    @_rpc
    async def host_reply_to_review(
        self, request: service_pb2.HostReplyToReviewRequest, ctx: RequestContext
    ) -> types_pb2.ReviewSummary:
        _ensure_supabase()
        auth = require_host(ctx)
        payload = proto_to_pydantic(request.reply, s.HostReplyRequest)
        return pydantic_to_proto(host_reply_to_review(auth, request.review_id, payload), types_pb2.ReviewSummary)

    @_rpc
    async def list_admin_reviews(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminReviewsResponse:
        _ensure_supabase()
        require_admin(ctx)
        reviews = list_admin_reviews()
        return types_pb2.ListAdminReviewsResponse(
            reviews=[pydantic_to_proto(r, types_pb2.ReviewSummary) for r in reviews]
        )

    @_rpc
    async def hide_admin_review(
        self, request: service_pb2.HideAdminReviewRequest, ctx: RequestContext
    ) -> types_pb2.ReviewSummary:
        _ensure_supabase()
        auth = require_admin(ctx)
        return pydantic_to_proto(hide_review(auth, request.review_id), types_pb2.ReviewSummary)

    @_rpc
    async def list_notifications(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListNotificationsResponse:
        _ensure_supabase()
        auth = resolve_current_user(ctx)
        notifications = list_user_notifications(auth)
        return types_pb2.ListNotificationsResponse(
            notifications=[pydantic_to_proto(n, types_pb2.NotificationSummary) for n in notifications]
        )

    @_rpc
    async def mark_notification_read(
        self, request: service_pb2.MarkNotificationReadRequest, ctx: RequestContext
    ) -> types_pb2.NotificationSummary:
        _ensure_supabase()
        auth = resolve_current_user(ctx)
        return pydantic_to_proto(
            mark_notification_read(auth, request.notification_id), types_pb2.NotificationSummary
        )

    @_rpc
    async def mark_all_notifications_read(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.MarkAllNotificationsReadResponse:
        _ensure_supabase()
        auth = resolve_current_user(ctx)
        count = mark_all_notifications_read(auth)
        return types_pb2.MarkAllNotificationsReadResponse(ok=True, count=count)
