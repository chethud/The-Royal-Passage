export type BookSearchParams = {
  slotId?: string;
  guests?: number;
};

export function parseBookSearch(s: Record<string, unknown>): BookSearchParams {
  const guestsRaw = s.guests;
  let guests: number | undefined;
  if (typeof guestsRaw === "number" && Number.isFinite(guestsRaw)) {
    guests = guestsRaw;
  } else if (typeof guestsRaw === "string" && guestsRaw.trim()) {
    const parsed = Number.parseInt(guestsRaw, 10);
    if (Number.isFinite(parsed)) guests = parsed;
  }

  return {
    slotId: typeof s.slotId === "string" ? s.slotId : undefined,
    guests,
  };
}

export function bookExperiencePath(slug: string, search?: BookSearchParams): string {
  const base = `/experiences/${slug}/book`;
  if (!search?.slotId && search?.guests == null) return base;
  const params = new URLSearchParams();
  if (search.slotId) params.set("slotId", search.slotId);
  if (search.guests != null) params.set("guests", String(search.guests));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function guestBookingLimits(
  exp: { minGuestsPerBooking?: number; maxGuestsPerBooking?: number },
  slotAvailable: number,
) {
  const min = exp.minGuestsPerBooking ?? 1;
  const max = Math.min(exp.maxGuestsPerBooking ?? 10, Math.max(1, slotAvailable));
  return { min, max: Math.max(min, max) };
}
