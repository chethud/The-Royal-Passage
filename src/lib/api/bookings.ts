import { apiFetch } from "@/lib/api/client";

export type CreateBookingPayload = {
  slotId: string;
  guestCount: number;
  notes?: string;
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
};

export function createBooking(accessToken: string, payload: CreateBookingPayload) {
  return apiFetch<CreateBookingResult>("/api/v1/bookings", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function fetchMyBookings(accessToken: string, status?: "upcoming" | "past" | "cancelled") {
  const query = status ? `?status=${status}` : "";
  return apiFetch<BookingSummary[]>(`/api/v1/bookings/me${query}`, { accessToken });
}

export function fetchBookingById(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/bookings/${bookingId}`, { accessToken });
}

export function cancelBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/bookings/${bookingId}/cancel`, {
    method: "POST",
    accessToken,
  });
}
