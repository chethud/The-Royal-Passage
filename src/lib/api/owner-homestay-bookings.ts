import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  GetOwnerHomestayBookingRequestSchema,
  ListOwnerHomestayBookingsRequestSchema,
  OwnerHomestayBookingActionRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";

export type OwnerDashboardStats = {
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  revenueCollectedMinor: number;
  revenuePendingMinor: number;
  upcomingBookings: number;
  checkInToday: number;
  publishedHomestays: number;
  currencySymbol: string;
  totalBookings: number;
};

export type HomestayBookingSummary = {
  id: string;
  homestayId: string;
  homestayTitle: string;
  homestaySlug: string;
  roomName: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  totalAmount: number;
  currencyCode: string;
  currencySymbol: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  guestName: string | null;
  notes: string | null;
  createdAt: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  homestayAddress: string | null;
};

export function fetchOwnerDashboard(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.getOwnerDashboard({})) as Promise<OwnerDashboardStats>;
}

export function fetchOwnerHomestayBookings(
  accessToken: string,
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "upcoming" | "today",
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listOwnerHomestayBookings(
      create(ListOwnerHomestayBookingsRequestSchema, status ? { status } : {}),
    );
    return response.bookings as HomestayBookingSummary[];
  });
}

export function fetchOwnerHomestayBooking(accessToken: string, bookingId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getOwnerHomestayBooking(create(GetOwnerHomestayBookingRequestSchema, { bookingId })),
  ) as Promise<HomestayBookingSummary>;
}

function ownerBookingAction(accessToken: string, bookingId: string, method: "confirm" | "reject" | "markPaid" | "complete") {
  const client = createRoyalPassageClient(accessToken);
  const request = create(OwnerHomestayBookingActionRequestSchema, { bookingId });
  const call =
    method === "confirm"
      ? client.confirmOwnerHomestayBooking.bind(client)
      : method === "reject"
        ? client.rejectOwnerHomestayBooking.bind(client)
        : method === "markPaid"
          ? client.markOwnerHomestayBookingPaid.bind(client)
          : client.completeOwnerHomestayBooking.bind(client);
  return rpcCall(() => call(request)) as Promise<HomestayBookingSummary>;
}

export const confirmOwnerHomestayBooking = (token: string, id: string) =>
  ownerBookingAction(token, id, "confirm");
export const rejectOwnerHomestayBooking = (token: string, id: string) =>
  ownerBookingAction(token, id, "reject");
export const markOwnerHomestayBookingPaid = (token: string, id: string) =>
  ownerBookingAction(token, id, "markPaid");
export const completeOwnerHomestayBooking = (token: string, id: string) =>
  ownerBookingAction(token, id, "complete");
