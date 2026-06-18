import type { Homestay, HomestayRoom } from "@/data/homestays";

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

export function maxExtraBeds(stay: Homestay, room?: HomestayRoom, roomCount = 1): number {
  if (room?.extraBedAvailable) return roomCount;
  if (usesPropertyLevelExtraBeds(stay, room)) return stay.bedrooms;
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

export function calculateStayTotalMinor(
  stay: Homestay,
  options: {
    roomId?: string;
    roomCount: number;
    extraBedCount: number;
    nights: number;
  },
) {
  const room = getSelectedRoom(stay, options.roomId);
  const pricePerNightMajor = room?.pricePerNight ?? stay.pricePerNight;
  const extraBedPriceMajor = room?.extraBedPricePerNight ?? stay.extraBedPricePerNight ?? 0;
  const nightlyRateMinor =
    pricePerNightMajor * 100 * options.roomCount +
    extraBedPriceMajor * 100 * options.extraBedCount;
  const totalMinor = nightlyRateMinor * Math.max(0, options.nights);
  return {
    room,
    pricePerNightMajor,
    extraBedPriceMajor,
    nightlyRateMinor,
    totalMinor,
  };
}
