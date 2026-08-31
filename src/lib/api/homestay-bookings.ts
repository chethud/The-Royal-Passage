import { apiFetch } from "@/lib/api/client";

export type CreateHomestayBookingPayload = {
  homestayId: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  roomCount?: number;
  extraBedCount?: number;
  notes?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  agentMarkupMinor?: number;
  clientSendConfirmation?: boolean;
  clientEmailIncludePrice?: boolean;
};

export type CreateHomestayBookingResult = {
  bookingId: string;
  totalAmount: number;
  currencyCode: string;
  bookingStatus: string;
  paymentStatus: string;
  nights: number;
};

export function createHomestayBooking(accessToken: string, payload: CreateHomestayBookingPayload) {
  return apiFetch<CreateHomestayBookingResult>("/api/v1/homestay-bookings", {
    accessToken,
    method: "POST",
    body: JSON.stringify(payload),
  });
}
