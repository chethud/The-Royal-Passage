import type { Homestay as ProtoHomestay } from "@/gen/royalpassage/v1/types_pb";
import type { Homestay, HomestayAmenity, HomestayRoom } from "@/data/homestays";

function mapProtoRoom(room: NonNullable<ProtoHomestay["rooms"]>[number]): HomestayRoom {
  return {
    id: room.id,
    name: room.name,
    category: room.category,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight,
    weekendPricePerNight: room.weekendPricePerNight,
    totalUnits: room.totalUnits,
    amenities: room.amenities ?? [],
    extraBedAvailable: room.extraBedAvailable,
    extraBedPricePerNight: room.extraBedPricePerNight,
    extraBedWeekendPricePerNight: room.weekendExtraBedPricePerNight ?? room.extraBedPricePerNight,
    extraBedsPerRoom: room.extraBedsPerRoom,
  };
}

export function mapProtoHomestay(stay: ProtoHomestay): Homestay {
  const galleryUrls =
    stay.galleryUrls?.length ? stay.galleryUrls : stay.image ? [stay.image] : [];
  return {
    id: stay.id,
    slug: stay.slug,
    title: stay.title,
    tagline: stay.tagline,
    description: stay.description,
    propertyType: stay.propertyType as Homestay["propertyType"],
    city: stay.city,
    region: stay.region,
    address: stay.address,
    mapLink: stay.mapLink,
    pricePerNight: stay.pricePerNight,
    weekendPricePerNight: stay.weekendPricePerNight,
    currencySymbol: stay.currencySymbol || "₹",
    rating: stay.rating,
    reviewsCount: stay.reviewsCount,
    image: stay.image,
    galleryUrls,
    amenities: (stay.amenities ?? []) as HomestayAmenity[],
    bedrooms: stay.bedrooms,
    bathrooms: stay.bathrooms,
    maxGuests: stay.maxGuests,
    checkInTime: stay.checkInTime,
    checkOutTime: stay.checkOutTime,
    houseRules: stay.houseRules ?? [],
    rooms: stay.rooms?.length ? stay.rooms.map(mapProtoRoom) : undefined,
    extraBedAvailable: stay.extraBedAvailable,
    extraBedPricePerNight: stay.extraBedPricePerNight,
    extraBedWeekendPricePerNight: stay.weekendExtraBedPricePerNight ?? stay.extraBedPricePerNight,
    extraBedsPerRoom: stay.extraBedsPerRoom,
    datePrices: (stay.datePrices ?? []).map((entry) => ({
      date: entry.date,
      pricePerNight: entry.pricePerNight,
      label: entry.label,
      extraBedPricePerNight: entry.extraBedPricePerNight,
    })),
  };
}
