import type { Homestay, HomestayRoom } from "@/data/homestays";
import { eachNightBetween, nightPriceMajor, buildDatePriceMap, isHomestayWeekend } from "@/lib/homestay-day-pricing";

export function normalizeExtraBedsPerRoom(value?: number | null): 1 | 2 {
  return value != null && value >= 2 ? 2 : 1;
}

export function getActiveRooms(stay: Homestay): HomestayRoom[] {
  return stay.rooms ?? [];
}

export function getSelectedRoom(stay: Homestay, roomId?: string): HomestayRoom | undefined {
  const rooms = getActiveRooms(stay);
  if (roomId) return rooms.find((room) => room.id === roomId);
  if (rooms.length === 1) return rooms[0];
  return undefined;
}

export function usesPropertyLevelExtraBeds(stay: Homestay, room?: HomestayRoom): boolean {
  return getActiveRooms(stay).length === 0 && !room && stay.extraBedAvailable;
}

export function maxRoomCount(room: HomestayRoom | undefined): number {
  return room?.totalUnits ?? 1;
}

export function extraBedsPerRoomForSelection(stay: Homestay, room?: HomestayRoom): number {
  if (room?.extraBedAvailable) return normalizeExtraBedsPerRoom(room.extraBedsPerRoom);
  if (usesPropertyLevelExtraBeds(stay, room)) return normalizeExtraBedsPerRoom(stay.extraBedsPerRoom);
  return 1;
}

export function maxExtraBeds(stay: Homestay, room?: HomestayRoom, roomCount = 1): number {
  const perRoom = extraBedsPerRoomForSelection(stay, room);
  if (room?.extraBedAvailable) return roomCount * perRoom;
  if (usesPropertyLevelExtraBeds(stay, room)) return stay.bedrooms * perRoom;
  return 0;
}

export function maxGuestsForSelection(
  stay: Homestay,
  room: HomestayRoom | undefined,
  roomCount: number,
  extraBedCount: number,
): number {
  if (room) return roomCount * room.capacity + extraBedCount;
  return stay.maxGuests + extraBedCount;
}

export function weekdayExtraBedPriceMajor(stay: Homestay, room?: HomestayRoom): number {
  return room?.extraBedPricePerNight ?? stay.extraBedPricePerNight ?? 0;
}

export function weekendExtraBedPriceMajor(stay: Homestay, room?: HomestayRoom): number {
  return (
    room?.extraBedWeekendPricePerNight ??
    room?.extraBedPricePerNight ??
    stay.extraBedWeekendPricePerNight ??
    stay.extraBedPricePerNight ??
    0
  );
}

export function calculateStayTotalMinor(
  stay: Homestay,
  options: {
    roomId?: string;
    roomCount: number;
    extraBedCount: number;
    checkIn: string;
    checkOut: string;
  },
) {
  const room = getSelectedRoom(stay, options.roomId);
  const nights = eachNightBetween(options.checkIn, options.checkOut);
  const datePriceMap = buildDatePriceMap(stay.datePrices);
  const weekdayExtraMajor = weekdayExtraBedPriceMajor(stay, room);
  const weekendExtraMajor = weekendExtraBedPriceMajor(stay, room);

  let totalMinor = 0;
  for (const night of nights) {
    const nightMajor = nightPriceMajor(stay, night, room, datePriceMap);
    const extraMajor = isHomestayWeekend(night) ? weekendExtraMajor : weekdayExtraMajor;
    totalMinor += nightMajor * 100 * options.roomCount + extraMajor * 100 * options.extraBedCount;
  }

  const pricePerNightMajor = nights.length
    ? Math.round(totalMinor / nights.length / 100 / Math.max(1, options.roomCount))
    : (room?.pricePerNight ?? stay.pricePerNight);

  return {
    room,
    pricePerNightMajor,
    extraBedPriceMajor: weekdayExtraMajor,
    extraBedWeekendPriceMajor: weekendExtraMajor,
    nightlyRateMinor: nights.length ? Math.round(totalMinor / nights.length) : 0,
    totalMinor,
    nights: nights.length,
  };
}
