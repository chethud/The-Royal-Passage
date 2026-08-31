export type HomestayBookSearch = {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomId?: string;
  roomCount?: number;
  extraBeds?: number;
  /** Travel agent markup in major currency units (₹). */
  markup?: number;
};

function readDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return trimmed;
}

function readPositiveInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.trunc(value);
    return n > 0 ? n : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}

function readNonNegativeInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.trunc(value);
    return n >= 0 ? n : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }
  return undefined;
}

export function parseHomestayBookSearch(search: Record<string, unknown>): HomestayBookSearch {
  return {
    checkIn: readDate(search.checkIn),
    checkOut: readDate(search.checkOut),
    guests: readPositiveInt(search.guests),
    roomId: typeof search.roomId === "string" && search.roomId.trim() ? search.roomId.trim() : undefined,
    roomCount: readPositiveInt(search.roomCount),
    extraBeds: readNonNegativeInt(search.extraBeds),
    markup: readNonNegativeInt(search.markup),
  };
}

/** Build a clean search object for Links / navigate (omit empty / default-only fields). */
export function buildHomestayBookSearch(input: {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomId?: string;
  roomCount?: number;
  extraBeds?: number;
  markup?: number;
}): HomestayBookSearch {
  const checkIn = readDate(input.checkIn);
  const checkOut = readDate(input.checkOut);
  const guests = readPositiveInt(input.guests);
  const roomId =
    typeof input.roomId === "string" && input.roomId.trim() ? input.roomId.trim() : undefined;
  const roomCount = readPositiveInt(input.roomCount);
  const extraBeds = readNonNegativeInt(input.extraBeds);
  const markup = readNonNegativeInt(input.markup);

  return {
    ...(checkIn ? { checkIn } : {}),
    ...(checkOut ? { checkOut } : {}),
    ...(guests ? { guests } : {}),
    ...(roomId ? { roomId } : {}),
    ...(roomCount && roomCount > 1 ? { roomCount } : {}),
    ...(extraBeds && extraBeds > 0 ? { extraBeds } : {}),
    ...(markup && markup > 0 ? { markup } : {}),
  };
}

export function bookHomestayPath(slug: string, search?: HomestayBookSearch) {
  const clean = buildHomestayBookSearch(search ?? {});
  const params = new URLSearchParams();
  if (clean.checkIn) params.set("checkIn", clean.checkIn);
  if (clean.checkOut) params.set("checkOut", clean.checkOut);
  if (clean.guests) params.set("guests", String(clean.guests));
  if (clean.roomId) params.set("roomId", clean.roomId);
  if (clean.roomCount) params.set("roomCount", String(clean.roomCount));
  if (clean.extraBeds) params.set("extraBeds", String(clean.extraBeds));
  if (clean.markup) params.set("markup", String(clean.markup));
  const query = params.toString();
  return query ? `/homestays/${slug}/book?${query}` : `/homestays/${slug}/book`;
}
