from google.protobuf import empty_pb2 as _empty_pb2
from royalpassage.v1 import types_pb2 as _types_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class GetCityRequest(_message.Message):
    __slots__ = ("slug",)
    SLUG_FIELD_NUMBER: _ClassVar[int]
    slug: str
    def __init__(self, slug: _Optional[str] = ...) -> None: ...

class GetCatalogRequest(_message.Message):
    __slots__ = ("city_slug",)
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    city_slug: str
    def __init__(self, city_slug: _Optional[str] = ...) -> None: ...

class GetExperienceBySlugRequest(_message.Message):
    __slots__ = ("slug",)
    SLUG_FIELD_NUMBER: _ClassVar[int]
    slug: str
    def __init__(self, slug: _Optional[str] = ...) -> None: ...

class ListHomestaysRequest(_message.Message):
    __slots__ = ("city_slug",)
    CITY_SLUG_FIELD_NUMBER: _ClassVar[int]
    city_slug: str
    def __init__(self, city_slug: _Optional[str] = ...) -> None: ...

class GetHomestayBySlugRequest(_message.Message):
    __slots__ = ("slug",)
    SLUG_FIELD_NUMBER: _ClassVar[int]
    slug: str
    def __init__(self, slug: _Optional[str] = ...) -> None: ...

class ListMyBookingsRequest(_message.Message):
    __slots__ = ("status",)
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: str
    def __init__(self, status: _Optional[str] = ...) -> None: ...

class GetBookingRequest(_message.Message):
    __slots__ = ("booking_id",)
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    def __init__(self, booking_id: _Optional[str] = ...) -> None: ...

class CancelBookingRequest(_message.Message):
    __slots__ = ("booking_id",)
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    def __init__(self, booking_id: _Optional[str] = ...) -> None: ...

class AddToWishlistRequest(_message.Message):
    __slots__ = ("experience_id",)
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    def __init__(self, experience_id: _Optional[str] = ...) -> None: ...

class RemoveFromWishlistRequest(_message.Message):
    __slots__ = ("experience_id",)
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    def __init__(self, experience_id: _Optional[str] = ...) -> None: ...

class ListHostBookingsRequest(_message.Message):
    __slots__ = ("status",)
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: str
    def __init__(self, status: _Optional[str] = ...) -> None: ...

class GetHostBookingRequest(_message.Message):
    __slots__ = ("booking_id",)
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    def __init__(self, booking_id: _Optional[str] = ...) -> None: ...

class GetHostExperienceRequest(_message.Message):
    __slots__ = ("experience_id",)
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    def __init__(self, experience_id: _Optional[str] = ...) -> None: ...

class DeleteHostExperienceRequest(_message.Message):
    __slots__ = ("experience_id",)
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    def __init__(self, experience_id: _Optional[str] = ...) -> None: ...

class CreateHostSlotInput(_message.Message):
    __slots__ = ("experience_id", "slot")
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    SLOT_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    slot: _types_pb2.CreateHostSlotRequest
    def __init__(self, experience_id: _Optional[str] = ..., slot: _Optional[_Union[_types_pb2.CreateHostSlotRequest, _Mapping]] = ...) -> None: ...

class UpdateHostSlotInput(_message.Message):
    __slots__ = ("experience_id", "slot_id", "slot")
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    SLOT_ID_FIELD_NUMBER: _ClassVar[int]
    SLOT_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    slot_id: str
    slot: _types_pb2.UpdateHostSlotRequest
    def __init__(self, experience_id: _Optional[str] = ..., slot_id: _Optional[str] = ..., slot: _Optional[_Union[_types_pb2.UpdateHostSlotRequest, _Mapping]] = ...) -> None: ...

class DeleteHostSlotRequest(_message.Message):
    __slots__ = ("experience_id", "slot_id")
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    SLOT_ID_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    slot_id: str
    def __init__(self, experience_id: _Optional[str] = ..., slot_id: _Optional[str] = ...) -> None: ...

class HostBookingActionRequest(_message.Message):
    __slots__ = ("booking_id", "decision_name", "decision_phone", "reason")
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    DECISION_NAME_FIELD_NUMBER: _ClassVar[int]
    DECISION_PHONE_FIELD_NUMBER: _ClassVar[int]
    REASON_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    decision_name: str
    decision_phone: str
    reason: str
    def __init__(self, booking_id: _Optional[str] = ..., decision_name: _Optional[str] = ..., decision_phone: _Optional[str] = ..., reason: _Optional[str] = ...) -> None: ...

class AdminExperienceActionRequest(_message.Message):
    __slots__ = ("experience_id",)
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    def __init__(self, experience_id: _Optional[str] = ...) -> None: ...

class ListExperienceReviewsRequest(_message.Message):
    __slots__ = ("slug",)
    SLUG_FIELD_NUMBER: _ClassVar[int]
    slug: str
    def __init__(self, slug: _Optional[str] = ...) -> None: ...

class HostReplyToReviewRequest(_message.Message):
    __slots__ = ("review_id", "reply")
    REVIEW_ID_FIELD_NUMBER: _ClassVar[int]
    REPLY_FIELD_NUMBER: _ClassVar[int]
    review_id: str
    reply: _types_pb2.HostReplyRequest
    def __init__(self, review_id: _Optional[str] = ..., reply: _Optional[_Union[_types_pb2.HostReplyRequest, _Mapping]] = ...) -> None: ...

class HideAdminReviewRequest(_message.Message):
    __slots__ = ("review_id",)
    REVIEW_ID_FIELD_NUMBER: _ClassVar[int]
    review_id: str
    def __init__(self, review_id: _Optional[str] = ...) -> None: ...

class MarkNotificationReadRequest(_message.Message):
    __slots__ = ("notification_id",)
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    def __init__(self, notification_id: _Optional[str] = ...) -> None: ...

class UpdateHostExperienceInput(_message.Message):
    __slots__ = ("experience_id", "experience")
    EXPERIENCE_ID_FIELD_NUMBER: _ClassVar[int]
    EXPERIENCE_FIELD_NUMBER: _ClassVar[int]
    experience_id: str
    experience: _types_pb2.UpdateHostExperienceRequest
    def __init__(self, experience_id: _Optional[str] = ..., experience: _Optional[_Union[_types_pb2.UpdateHostExperienceRequest, _Mapping]] = ...) -> None: ...

class ListGuestHomestayBookingsRequest(_message.Message):
    __slots__ = ("status",)
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: str
    def __init__(self, status: _Optional[str] = ...) -> None: ...

class GetGuestHomestayBookingRequest(_message.Message):
    __slots__ = ("booking_id",)
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    def __init__(self, booking_id: _Optional[str] = ...) -> None: ...

class CancelGuestHomestayBookingRequest(_message.Message):
    __slots__ = ("booking_id",)
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    def __init__(self, booking_id: _Optional[str] = ...) -> None: ...

class GetOwnerHomestayRequest(_message.Message):
    __slots__ = ("homestay_id",)
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    def __init__(self, homestay_id: _Optional[str] = ...) -> None: ...

class DeleteOwnerHomestayRequest(_message.Message):
    __slots__ = ("homestay_id",)
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    def __init__(self, homestay_id: _Optional[str] = ...) -> None: ...

class UpdateOwnerHomestayInput(_message.Message):
    __slots__ = ("homestay_id", "homestay")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    HOMESTAY_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    homestay: _types_pb2.UpdateOwnerHomestayRequest
    def __init__(self, homestay_id: _Optional[str] = ..., homestay: _Optional[_Union[_types_pb2.UpdateOwnerHomestayRequest, _Mapping]] = ...) -> None: ...

class CreateOwnerHomestayRoomInput(_message.Message):
    __slots__ = ("homestay_id", "room")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    room: _types_pb2.CreateOwnerHomestayRoomRequest
    def __init__(self, homestay_id: _Optional[str] = ..., room: _Optional[_Union[_types_pb2.CreateOwnerHomestayRoomRequest, _Mapping]] = ...) -> None: ...

class UpdateOwnerHomestayRoomInput(_message.Message):
    __slots__ = ("homestay_id", "room_id", "room")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    room_id: str
    room: _types_pb2.UpdateOwnerHomestayRoomRequest
    def __init__(self, homestay_id: _Optional[str] = ..., room_id: _Optional[str] = ..., room: _Optional[_Union[_types_pb2.UpdateOwnerHomestayRoomRequest, _Mapping]] = ...) -> None: ...

class DeleteOwnerHomestayRoomRequest(_message.Message):
    __slots__ = ("homestay_id", "room_id")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    room_id: str
    def __init__(self, homestay_id: _Optional[str] = ..., room_id: _Optional[str] = ...) -> None: ...

class UpsertOwnerAvailabilityInput(_message.Message):
    __slots__ = ("homestay_id", "availability")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    AVAILABILITY_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    availability: _types_pb2.UpsertOwnerAvailabilityRequest
    def __init__(self, homestay_id: _Optional[str] = ..., availability: _Optional[_Union[_types_pb2.UpsertOwnerAvailabilityRequest, _Mapping]] = ...) -> None: ...

class DeleteOwnerAvailabilityRequest(_message.Message):
    __slots__ = ("homestay_id", "availability_id")
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    AVAILABILITY_ID_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    availability_id: str
    def __init__(self, homestay_id: _Optional[str] = ..., availability_id: _Optional[str] = ...) -> None: ...

class ListOwnerHomestayBookingsRequest(_message.Message):
    __slots__ = ("status",)
    STATUS_FIELD_NUMBER: _ClassVar[int]
    status: str
    def __init__(self, status: _Optional[str] = ...) -> None: ...

class GetOwnerHomestayBookingRequest(_message.Message):
    __slots__ = ("booking_id",)
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    def __init__(self, booking_id: _Optional[str] = ...) -> None: ...

class OwnerHomestayBookingActionRequest(_message.Message):
    __slots__ = ("booking_id", "reason", "decision_name", "decision_phone")
    BOOKING_ID_FIELD_NUMBER: _ClassVar[int]
    REASON_FIELD_NUMBER: _ClassVar[int]
    DECISION_NAME_FIELD_NUMBER: _ClassVar[int]
    DECISION_PHONE_FIELD_NUMBER: _ClassVar[int]
    booking_id: str
    reason: str
    decision_name: str
    decision_phone: str
    def __init__(self, booking_id: _Optional[str] = ..., reason: _Optional[str] = ..., decision_name: _Optional[str] = ..., decision_phone: _Optional[str] = ...) -> None: ...

class AdminHomestayActionRequest(_message.Message):
    __slots__ = ("homestay_id",)
    HOMESTAY_ID_FIELD_NUMBER: _ClassVar[int]
    homestay_id: str
    def __init__(self, homestay_id: _Optional[str] = ...) -> None: ...

class AdminVipPackageActionRequest(_message.Message):
    __slots__ = ("package_id",)
    PACKAGE_ID_FIELD_NUMBER: _ClassVar[int]
    package_id: str
    def __init__(self, package_id: _Optional[str] = ...) -> None: ...

class GetOwnerVipPackageRequest(_message.Message):
    __slots__ = ("package_id",)
    PACKAGE_ID_FIELD_NUMBER: _ClassVar[int]
    package_id: str
    def __init__(self, package_id: _Optional[str] = ...) -> None: ...

class UpdateOwnerVipPackageInput(_message.Message):
    __slots__ = ("package_id", "package")
    PACKAGE_ID_FIELD_NUMBER: _ClassVar[int]
    PACKAGE_FIELD_NUMBER: _ClassVar[int]
    package_id: str
    package: _types_pb2.UpdateOwnerVipPackageRequest
    def __init__(self, package_id: _Optional[str] = ..., package: _Optional[_Union[_types_pb2.UpdateOwnerVipPackageRequest, _Mapping]] = ...) -> None: ...
