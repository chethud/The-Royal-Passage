import { apiFetch } from "@/lib/api/client";
import { normalizeBookingSummary } from "@/lib/booking-normalize";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type CreateBookingPayload = {
  slotId: string;
  guestCount: number;
  notes?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  agentMarkupMinor?: number;
  clientSendConfirmation?: boolean;
  clientEmailIncludePrice?: boolean;
};

export type CreateBookingResult = {
  bookingId: string;
  totalAmount: number;
  currencyCode: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
};

export type BookingSummary = {
  id: string;
  experience: {
    id: string;
    slug: string;
    title: string;
    city: string;
    address: string;
    image: string;
    hostName: string;
  };
  slot: {
    id: string;
    date: string;
    start: string;
    end: string;
  };
  participantCount: number;
  totalAmount: number;
  currencyCode: string;
  currencySymbol: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  confirmedAt: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  isPaused?: boolean;
  pausedAt?: string | null;
  decisionByName?: string | null;
  decisionByPhone?: string | null;
  rejectionReason?: string | null;
};

async function hydrateBookingExperienceSlug(booking: BookingSummary): Promise<BookingSummary> {
  const normalized = normalizeBookingSummary(booking);
  if (normalized.experience.slug || !normalized.experience.id) {
    return normalized;
  }

  if (typeof window === "undefined") {
    return normalized;
  }

  try {
    const { data } = await getSupabaseBrowser()
      .from("experiences")
      .select("slug")
      .eq("id", normalized.experience.id)
      .maybeSingle();
    if (data?.slug) {
      return {
        ...normalized,
        experience: { ...normalized.experience, slug: data.slug },
      };
    }
  } catch {
    // Keep booking usable even if slug lookup fails.
  }

  return normalized;
}

async function mapBookings(rows: BookingSummary[]): Promise<BookingSummary[]> {
  return Promise.all(rows.map((row) => hydrateBookingExperienceSlug(row)));
}

export function createBooking(accessToken: string, payload: CreateBookingPayload) {
  return apiFetch<CreateBookingResult>("/api/v1/bookings", {
    accessToken,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyBookings(accessToken: string, status?: "upcoming" | "past" | "cancelled") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<BookingSummary[]>(`/api/v1/bookings/me${query}`, { accessToken }).then((rows) =>
    mapBookings(rows),
  );
}

export function fetchBookingById(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/bookings/${bookingId}`, { accessToken }).then((row) =>
    hydrateBookingExperienceSlug(row),
  );
}

export function cancelBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/bookings/${bookingId}/cancel`, {
    accessToken,
    method: "POST",
  }).then((row) => hydrateBookingExperienceSlug(row));
}
