import type { Homestay, HomestayDatePrice, HomestayRoom } from "@/data/homestays";

/** Saturday and Sunday are weekend nights. */
export function isHomestayWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

export function buildDatePriceMap(datePrices?: HomestayDatePrice[]): Map<string, number> {
  return new Map((datePrices ?? []).map((entry) => [entry.date, entry.pricePerNight]));
}

export function weekdayPriceMajor(stay: Homestay, room?: HomestayRoom): number {
  return room?.pricePerNight ?? stay.pricePerNight;
}

export function weekendPriceMajor(stay: Homestay, room?: HomestayRoom): number {
  const weekend = room?.weekendPricePerNight ?? stay.weekendPricePerNight;
  if (weekend != null && weekend > 0) return weekend;
  return weekdayPriceMajor(stay, room);
}

export function hasDistinctWeekendPricing(stay: Homestay, room?: HomestayRoom): boolean {
  return weekendPriceMajor(stay, room) !== weekdayPriceMajor(stay, room);
}

export function nightPriceMajor(
  stay: Homestay,
  isoDate: string,
  room?: HomestayRoom,
  datePriceMap?: Map<string, number>,
): number {
  const override = datePriceMap?.get(isoDate);
  if (override != null && override > 0) return override;
  return isHomestayWeekend(isoDate) ? weekendPriceMajor(stay, room) : weekdayPriceMajor(stay, room);
}

export function eachNightBetween(checkIn: string, checkOut: string): string[] {
  if (!checkIn || !checkOut || checkOut <= checkIn) return [];
  const nights: string[] = [];
  const cursor = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  while (cursor < end) {
    nights.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
}

export function formatWeekdayWeekendRates(
  sym: string,
  weekdayMajor: number,
  weekendMajor: number,
): string {
  if (weekdayMajor === weekendMajor) {
    return `${sym}${weekdayMajor.toLocaleString("en-IN")}/night`;
  }
  return `${sym}${weekdayMajor.toLocaleString("en-IN")} weekdays · ${sym}${weekendMajor.toLocaleString("en-IN")} weekends`;
}
