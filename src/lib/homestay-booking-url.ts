export type HomestayBookSearch = {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomId?: string;
  roomCount?: number;
  extraBeds?: number;
};

export function parseHomestayBookSearch(search: Record<string, unknown>): HomestayBookSearch {
  const num = (value: unknown) => (typeof value === "string" && value ? Number(value) : undefined);
  return {
    checkIn: typeof search.checkIn === "string" ? search.checkIn : undefined,
    checkOut: typeof search.checkOut === "string" ? search.checkOut : undefined,
    guests: num(search.guests),
    roomId: typeof search.roomId === "string" ? search.roomId : undefined,
    roomCount: num(search.roomCount),
    extraBeds: num(search.extraBeds),
  };
}

export function bookHomestayPath(slug: string, search?: HomestayBookSearch) {
  const params = new URLSearchParams();
  if (search?.checkIn) params.set("checkIn", search.checkIn);
  if (search?.checkOut) params.set("checkOut", search.checkOut);
  if (search?.guests) params.set("guests", String(search.guests));
  if (search?.roomId) params.set("roomId", search.roomId);
  if (search?.roomCount && search.roomCount > 1) params.set("roomCount", String(search.roomCount));
  if (search?.extraBeds) params.set("extraBeds", String(search.extraBeds));
  const query = params.toString();
  return query ? `/homestays/${slug}/book?${query}` : `/homestays/${slug}/book`;
}
