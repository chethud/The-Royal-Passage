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

export function maxRoomCount(room: HomestayRoom | undefined): number {
  return room?.totalUnits ?? 1;
}

export function maxExtraBeds(room: HomestayRoom | undefined, roomCount: number): number {
  if (!room?.extraBedAvailable) return 0;
  return roomCount;
}

export function maxGuestsForSelection(
  room: HomestayRoom | undefined,
  roomCount: number,
  extraBedCount: number,
  fallbackMaxGuests: number,
): number {
  if (!room) return fallbackMaxGuests;
  return roomCount * room.capacity + extraBedCount;
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
  const extraBedPriceMajor = room?.extraBedPricePerNight ?? 0;
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
