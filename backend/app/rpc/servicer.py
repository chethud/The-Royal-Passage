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
from app.rpc.auth import require_admin, require_guest, require_host, require_homestay_owner, require_vip_owner, resolve_current_user
from app.rpc.converters import proto_to_pydantic, pydantic_to_proto
from app.services.admin_analytics import get_admin_stats, list_admin_activity, list_admin_bookings
from app.services.admin_homestays import (
    get_admin_homestay,
    list_admin_homestays,
    publish_homestay,
    reject_homestay,
)
from app.services.admin_vip_packages import (
    get_admin_vip_package,
    list_admin_vip_packages,
    publish_vip_package,
    reject_vip_package,
)
from app.services.admin_experiences import (
    get_admin_experience,
    list_pending_experiences,
    publish_experience,
    reject_experience,
)
from app.services.admin_users import create_host_account, list_managed_users
from app.services.homestay_bookings import (
    cancel_guest_homestay_booking,
    create_homestay_booking,
    get_guest_homestay_booking,
    list_guest_homestay_bookings,
)
from app.services.homestay_owners import create_homestay_owner_account
from app.services.vip_owners import create_vip_owner_account
from app.services.owner_homestay_bookings import (
    complete_owner_homestay_booking,
    confirm_owner_homestay_booking,
    get_owner_dashboard,
    get_owner_homestay_booking,
    list_owner_homestay_bookings,
    mark_owner_homestay_booking_paid,
    reject_owner_homestay_booking,
)
from app.services.owner_vip_packages import (
    create_owner_vip_package,
    get_owner_vip_package,
    list_owner_vip_packages,
    update_owner_vip_package,
)
from app.services.owner_homestays import (
    create_owner_homestay,
    create_owner_homestay_room,
    delete_owner_availability,
    delete_owner_homestay,
    delete_owner_homestay_room,
    get_owner_homestay,
    list_owner_homestays,
    update_owner_homestay,
    update_owner_homestay_room,
    upsert_owner_availability,
)
from app.services.homestays import get_homestay_detail, list_homestays
from app.services.audit import log_audit
from app.services.bookings import cancel_guest_booking, create_cod_booking, get_booking_by_id, list_guest_bookings
from app.services.cities import get_city_by_slug, list_active_cities
from app.services.guest_profile import get_guest_profile, update_guest_profile
from app.services.vip_membership import (
    approve_vip_membership,
    list_vip_custom_package_requests,
    list_vip_membership_applications,
    reject_vip_membership,
    skip_vip_membership_interest,
    submit_vip_custom_package_request,
    submit_vip_membership_application,
)
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
    async def list_homestays(
        self, request: service_pb2.ListHomestaysRequest, _ctx: RequestContext
    ) -> types_pb2.ListHomestaysResponse:
        _ensure_supabase()
        city_slug = request.city_slug if request.HasField("city_slug") else None
        return pydantic_to_proto(list_homestays(city_slug), types_pb2.ListHomestaysResponse)

    @_rpc
    async def get_homestay_by_slug(
        self, request: service_pb2.GetHomestayBySlugRequest, _ctx: RequestContext
    ) -> types_pb2.HomestayDetailResponse:
        _ensure_supabase()
        detail = get_homestay_detail(request.slug)
        if not detail:
            raise ConnectError(Code.NOT_FOUND, "Homestay not found.")
        return pydantic_to_proto(detail, types_pb2.HomestayDetailResponse)

    @_rpc
    async def create_homestay_booking(
        self, request: types_pb2.CreateHomestayBookingRequest, ctx: RequestContext
    ) -> types_pb2.CreateHomestayBookingResponse:
        _ensure_supabase()
        auth = require_guest(ctx)
        payload = proto_to_pydantic(request, s.CreateHomestayBookingRequest)
        return pydantic_to_proto(create_homestay_booking(payload, auth), types_pb2.CreateHomestayBookingResponse)

    @_rpc
    async def list_guest_homestay_bookings(
        self, request: service_pb2.ListGuestHomestayBookingsRequest, ctx: RequestContext
    ) -> types_pb2.ListHomestayBookingsResponse:
        _ensure_supabase()
        auth = require_guest(ctx)
        status = request.status if request.HasField("status") else None
        result = list_guest_homestay_bookings(auth, status)
        return types_pb2.ListHomestayBookingsResponse(
            bookings=[pydantic_to_proto(b, types_pb2.HomestayBookingSummary) for b in result.bookings]
        )

    @_rpc
    async def get_guest_homestay_booking(
        self, request: service_pb2.GetGuestHomestayBookingRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_guest(ctx)
        return pydantic_to_proto(
            get_guest_homestay_booking(auth, request.booking_id), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def cancel_guest_homestay_booking(
        self, request: service_pb2.CancelGuestHomestayBookingRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_guest(ctx)
        return pydantic_to_proto(
            cancel_guest_homestay_booking(auth, request.booking_id), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def get_owner_dashboard(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.OwnerDashboardStats:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(get_owner_dashboard(auth), types_pb2.OwnerDashboardStats)

    @_rpc
    async def list_owner_homestays(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListOwnerHomestaysResponse:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        homestays = list_owner_homestays(auth)
        return types_pb2.ListOwnerHomestaysResponse(
            homestays=[pydantic_to_proto(h, types_pb2.OwnerHomestaySummary) for h in homestays]
        )

    @_rpc
    async def create_owner_homestay(
        self, request: types_pb2.CreateOwnerHomestayRequest, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        payload = proto_to_pydantic(request, s.CreateOwnerHomestayRequest)
        return pydantic_to_proto(create_owner_homestay(auth, payload), types_pb2.OwnerHomestayDetail)

    @_rpc
    async def get_owner_homestay(
        self, request: service_pb2.GetOwnerHomestayRequest, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(get_owner_homestay(auth, request.homestay_id), types_pb2.OwnerHomestayDetail)

    @_rpc
    async def update_owner_homestay(
        self, request: service_pb2.UpdateOwnerHomestayInput, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        payload = proto_to_pydantic(request.homestay, s.UpdateOwnerHomestayRequest)
        return pydantic_to_proto(
            update_owner_homestay(auth, request.homestay_id, payload), types_pb2.OwnerHomestayDetail
        )

    @_rpc
    async def delete_owner_homestay(
        self, request: service_pb2.DeleteOwnerHomestayRequest, ctx: RequestContext
    ) -> types_pb2.OkResponse:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        delete_owner_homestay(auth, request.homestay_id)
        return types_pb2.OkResponse(ok=True)

    @_rpc
    async def create_owner_homestay_room(
        self, request: service_pb2.CreateOwnerHomestayRoomInput, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        payload = proto_to_pydantic(request.room, s.CreateOwnerHomestayRoomRequest)
        return pydantic_to_proto(
            create_owner_homestay_room(auth, request.homestay_id, payload), types_pb2.OwnerHomestayDetail
        )

    @_rpc
    async def update_owner_homestay_room(
        self, request: service_pb2.UpdateOwnerHomestayRoomInput, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        payload = proto_to_pydantic(request.room, s.UpdateOwnerHomestayRoomRequest)
        return pydantic_to_proto(
            update_owner_homestay_room(auth, request.homestay_id, request.room_id, payload),
            types_pb2.OwnerHomestayDetail,
        )

    @_rpc
    async def delete_owner_homestay_room(
        self, request: service_pb2.DeleteOwnerHomestayRoomRequest, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            delete_owner_homestay_room(auth, request.homestay_id, request.room_id),
            types_pb2.OwnerHomestayDetail,
        )

    @_rpc
    async def upsert_owner_availability(
        self, request: service_pb2.UpsertOwnerAvailabilityInput, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        payload = proto_to_pydantic(request.availability, s.UpsertOwnerAvailabilityRequest)
        return pydantic_to_proto(
            upsert_owner_availability(auth, request.homestay_id, payload), types_pb2.OwnerHomestayDetail
        )

    @_rpc
    async def delete_owner_availability(
        self, request: service_pb2.DeleteOwnerAvailabilityRequest, ctx: RequestContext
    ) -> types_pb2.OwnerHomestayDetail:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            delete_owner_availability(auth, request.homestay_id, request.availability_id),
            types_pb2.OwnerHomestayDetail,
        )

    @_rpc
    async def list_owner_homestay_bookings(
        self, request: service_pb2.ListOwnerHomestayBookingsRequest, ctx: RequestContext
    ) -> types_pb2.ListHomestayBookingsResponse:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        status = request.status if request.HasField("status") else None
        result = list_owner_homestay_bookings(auth, status)
        return types_pb2.ListHomestayBookingsResponse(
            bookings=[pydantic_to_proto(b, types_pb2.HomestayBookingSummary) for b in result.bookings]
        )

    @_rpc
    async def get_owner_homestay_booking(
        self, request: service_pb2.GetOwnerHomestayBookingRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            get_owner_homestay_booking(auth, request.booking_id), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def confirm_owner_homestay_booking(
        self, request: service_pb2.OwnerHomestayBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            confirm_owner_homestay_booking(request.booking_id, auth), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def reject_owner_homestay_booking(
        self, request: service_pb2.OwnerHomestayBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            reject_owner_homestay_booking(request.booking_id, auth), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def mark_owner_homestay_booking_paid(
        self, request: service_pb2.OwnerHomestayBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            mark_owner_homestay_booking_paid(request.booking_id, auth), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def complete_owner_homestay_booking(
        self, request: service_pb2.OwnerHomestayBookingActionRequest, ctx: RequestContext
    ) -> types_pb2.HomestayBookingSummary:
        _ensure_supabase()
        auth = require_homestay_owner(ctx)
        return pydantic_to_proto(
            complete_owner_homestay_booking(request.booking_id, auth), types_pb2.HomestayBookingSummary
        )

    @_rpc
    async def list_owner_vip_packages(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListOwnerVipPackagesResponse:
        _ensure_supabase()
        auth = require_vip_owner(ctx)
        packages = list_owner_vip_packages(auth)
        return types_pb2.ListOwnerVipPackagesResponse(
            packages=[pydantic_to_proto(pkg, types_pb2.OwnerVipPackageSummary) for pkg in packages]
        )

    @_rpc
    async def create_owner_vip_package(
        self, request: types_pb2.CreateOwnerVipPackageRequest, ctx: RequestContext
    ) -> types_pb2.OwnerVipPackageDetail:
        _ensure_supabase()
        auth = require_vip_owner(ctx)
        payload = proto_to_pydantic(request, s.CreateOwnerVipPackageRequest)
        return pydantic_to_proto(create_owner_vip_package(auth, payload), types_pb2.OwnerVipPackageDetail)

    @_rpc
    async def get_owner_vip_package(
        self, request: service_pb2.GetOwnerVipPackageRequest, ctx: RequestContext
    ) -> types_pb2.OwnerVipPackageDetail:
        _ensure_supabase()
        auth = require_vip_owner(ctx)
        return pydantic_to_proto(
            get_owner_vip_package(auth, request.package_id), types_pb2.OwnerVipPackageDetail
        )

    @_rpc
    async def update_owner_vip_package(
        self, request: service_pb2.UpdateOwnerVipPackageInput, ctx: RequestContext
    ) -> types_pb2.OwnerVipPackageDetail:
        _ensure_supabase()
        auth = require_vip_owner(ctx)
        payload = proto_to_pydantic(request.package, s.UpdateOwnerVipPackageRequest)
        return pydantic_to_proto(
            update_owner_vip_package(auth, request.package_id, payload),
            types_pb2.OwnerVipPackageDetail,
        )

    @_rpc
    async def skip_vip_membership_interest(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.GuestProfile:
        _ensure_supabase()
        auth = require_guest(ctx)
        return pydantic_to_proto(skip_vip_membership_interest(auth), types_pb2.GuestProfile)

    @_rpc
    async def submit_vip_membership_application(
        self, request: types_pb2.SubmitVipMembershipApplicationRequest, ctx: RequestContext
    ) -> types_pb2.GuestProfile:
        _ensure_supabase()
        auth = require_guest(ctx)
        payload = proto_to_pydantic(request, s.SubmitVipMembershipApplicationRequest)
        return pydantic_to_proto(
            submit_vip_membership_application(auth, payload), types_pb2.GuestProfile
        )

    @_rpc
    async def submit_vip_custom_package_request(
        self, request: types_pb2.CreateVipCustomPackageRequest, ctx: RequestContext
    ) -> types_pb2.VipCustomPackageRequestSummary:
        _ensure_supabase()
        auth = require_guest(ctx)
        payload = proto_to_pydantic(request, s.CreateVipCustomPackageRequest)
        return pydantic_to_proto(
            submit_vip_custom_package_request(auth, payload),
            types_pb2.VipCustomPackageRequestSummary,
        )

    @_rpc
    async def list_vip_membership_applications(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListVipMembershipApplicationsResponse:
        _ensure_supabase()
        require_vip_owner(ctx)
        result = list_vip_membership_applications()
        return types_pb2.ListVipMembershipApplicationsResponse(
            applications=[
                pydantic_to_proto(app, types_pb2.VipMembershipApplicationSummary)
                for app in result.applications
            ]
        )

    @_rpc
    async def approve_vip_membership(
        self, request: types_pb2.VipMembershipActionRequest, ctx: RequestContext
    ) -> types_pb2.VipMembershipApplicationSummary:
        _ensure_supabase()
        auth = require_vip_owner(ctx)
        result = approve_vip_membership(request.application_id, auth["user"].id)
        return pydantic_to_proto(result, types_pb2.VipMembershipApplicationSummary)

    @_rpc
    async def reject_vip_membership(
        self, request: types_pb2.VipMembershipActionRequest, ctx: RequestContext
    ) -> types_pb2.VipMembershipApplicationSummary:
        _ensure_supabase()
        auth = require_vip_owner(ctx)
        result = reject_vip_membership(request.application_id, auth["user"].id)
        return pydantic_to_proto(result, types_pb2.VipMembershipApplicationSummary)

    @_rpc
    async def list_vip_custom_package_requests(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListVipCustomPackageRequestsResponse:
        _ensure_supabase()
        require_vip_owner(ctx)
        result = list_vip_custom_package_requests()
        return types_pb2.ListVipCustomPackageRequestsResponse(
            requests=[
                pydantic_to_proto(row, types_pb2.VipCustomPackageRequestSummary)
                for row in result.requests
            ]
        )

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
    async def create_homestay_owner(
        self, request: types_pb2.CreateHomestayOwnerRequest, ctx: RequestContext
    ) -> types_pb2.CreateHomestayOwnerResponse:
        _ensure_supabase()
        require_admin(ctx)
        payload = proto_to_pydantic(request, s.CreateHomestayOwnerRequest)
        return pydantic_to_proto(
            create_homestay_owner_account(payload),
            types_pb2.CreateHomestayOwnerResponse,
        )

    @_rpc
    async def create_vip_owner(
        self, request: types_pb2.CreateVipOwnerRequest, ctx: RequestContext
    ) -> types_pb2.CreateVipOwnerResponse:
        _ensure_supabase()
        require_admin(ctx)
        payload = proto_to_pydantic(request, s.CreateVipOwnerRequest)
        return pydantic_to_proto(
            create_vip_owner_account(payload),
            types_pb2.CreateVipOwnerResponse,
        )

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
    async def list_admin_homestays(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminHomestaysResponse:
        _ensure_supabase()
        require_admin(ctx)
        result = list_admin_homestays()
        return types_pb2.ListAdminHomestaysResponse(
            homestays=[pydantic_to_proto(h, types_pb2.AdminHomestaySummary) for h in result.homestays]
        )

    @_rpc
    async def get_admin_homestay(
        self, request: service_pb2.AdminHomestayActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminHomestayDetail:
        _ensure_supabase()
        require_admin(ctx)
        return pydantic_to_proto(get_admin_homestay(request.homestay_id), types_pb2.AdminHomestayDetail)

    @_rpc
    async def publish_homestay(
        self, request: service_pb2.AdminHomestayActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminHomestaySummary:
        _ensure_supabase()
        auth = require_admin(ctx)
        result = publish_homestay(request.homestay_id)
        log_audit(auth["user"].id, "homestay_published", "homestay", request.homestay_id, {})
        return pydantic_to_proto(result, types_pb2.AdminHomestaySummary)

    @_rpc
    async def reject_homestay(
        self, request: service_pb2.AdminHomestayActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminHomestaySummary:
        _ensure_supabase()
        require_admin(ctx)
        return pydantic_to_proto(reject_homestay(request.homestay_id), types_pb2.AdminHomestaySummary)

    @_rpc
    async def list_admin_vip_packages(
        self, _request: empty_pb2.Empty, ctx: RequestContext
    ) -> types_pb2.ListAdminVipPackagesResponse:
        _ensure_supabase()
        require_admin(ctx)
        result = list_admin_vip_packages()
        return types_pb2.ListAdminVipPackagesResponse(
            packages=[pydantic_to_proto(p, types_pb2.AdminVipPackageSummary) for p in result.packages]
        )

    @_rpc
    async def get_admin_vip_package(
        self, request: service_pb2.AdminVipPackageActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminVipPackageDetail:
        _ensure_supabase()
        require_admin(ctx)
        return pydantic_to_proto(
            get_admin_vip_package(request.package_id), types_pb2.AdminVipPackageDetail
        )

    @_rpc
    async def publish_vip_package(
        self, request: service_pb2.AdminVipPackageActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminVipPackageSummary:
        _ensure_supabase()
        auth = require_admin(ctx)
        result = publish_vip_package(request.package_id)
        log_audit(auth["user"].id, "vip_package_published", "vip_package", request.package_id, {})
        return pydantic_to_proto(result, types_pb2.AdminVipPackageSummary)

    @_rpc
    async def reject_vip_package(
        self, request: service_pb2.AdminVipPackageActionRequest, ctx: RequestContext
    ) -> types_pb2.AdminVipPackageSummary:
        _ensure_supabase()
        require_admin(ctx)
        return pydantic_to_proto(reject_vip_package(request.package_id), types_pb2.AdminVipPackageSummary)

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
