import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  CancelGuestHomestayBookingRequestSchema,
  GetGuestHomestayBookingRequestSchema,
  ListGuestHomestayBookingsRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";

export function fetchGuestHomestayBookings(
  accessToken: string,
  status?: "upcoming" | "past" | "cancelled",
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listGuestHomestayBookings(
      create(ListGuestHomestayBookingsRequestSchema, status ? { status } : {}),
    );
    return response.bookings as HomestayBookingSummary[];
  });
}

export function fetchGuestHomestayBooking(accessToken: string, bookingId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getGuestHomestayBooking(create(GetGuestHomestayBookingRequestSchema, { bookingId })),
  ) as Promise<HomestayBookingSummary>;
}

export function cancelGuestHomestayBooking(accessToken: string, bookingId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.cancelGuestHomestayBooking(create(CancelGuestHomestayBookingRequestSchema, { bookingId })),
  ) as Promise<HomestayBookingSummary>;
}
