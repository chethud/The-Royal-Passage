import type { BookingSummary } from "@/lib/api/bookings";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function normalizeBookingSummary(raw: BookingSummary): BookingSummary {
  const source = raw as BookingSummary & Record<string, unknown>;
  const exp = readRecord(raw.experience);
  const slot = readRecord(raw.slot);

  return {
    ...raw,
    bookingStatus:
      readString(raw.bookingStatus) || readString(source.booking_status) || "pending",
    paymentStatus:
      readString(raw.paymentStatus) || readString(source.payment_status) || "pending",
    paymentMethod:
      readString(raw.paymentMethod) || readString(source.payment_method) || "cod",
    currencySymbol:
      readString(raw.currencySymbol) || readString(source.currency_symbol) || "₹",
    experience: {
      id: readString(exp.id),
      slug: readString(exp.slug),
      title: readString(exp.title) || "Experience",
      city: readString(exp.city),
      address: readString(exp.address),
      image: readString(exp.image),
      hostName: readString(exp.hostName) || readString(exp.host_name) || "Host",
    },
    slot: {
      id: readString(slot.id),
      date: readString(slot.date) || readString(slot.slotDate) || readString(slot.slot_date),
      start: readString(slot.start) || readString(slot.startTime) || readString(slot.start_time),
      end: readString(slot.end) || readString(slot.endTime) || readString(slot.end_time),
    },
  };
}

export function formatBookingExperienceLocation(
  experience: BookingSummary["experience"],
): string {
  const city = experience.city?.trim();
  const address = experience.address?.trim();
  const slug = experience.slug?.trim();

  if (address && address !== slug) {
    return city ? `${city} · ${address}` : address;
  }
  if (city) return city;
  return "Location shared after booking";
}

export function hasExperienceDetailLink(experience: BookingSummary["experience"]): boolean {
  return Boolean(experience.slug?.trim() || experience.id?.trim());
}
