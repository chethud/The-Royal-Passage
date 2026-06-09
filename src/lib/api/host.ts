import { create } from "@bufbuild/protobuf";
import type { BookingSummary } from "@/lib/api/bookings";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  GetHostBookingRequestSchema,
  HostBookingActionRequestSchema,
  ListHostBookingsRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";

export type HostDashboardStats = {
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  revenueCollectedMinor: number;
  revenuePendingMinor: number;
  weekRevenueEstimateMinor: number;
  upcomingBookings: number;
  todayBookings: number;
  publishedExperiences: number;
  currencySymbol: string;
};

export type HostRevenueDay = {
  date: string;
  collectedMinor: number;
  pendingMinor: number;
  estimatedMinor: number;
};

export type HostRevenueSummary = {
  collectedMinor: number;
  pendingMinor: number;
  estimatedMinor: number;
  week: HostRevenueDay[];
  currencySymbol: string;
};

export type HostReviewSummary = {
  id: string;
  experienceId: string;
  experienceTitle: string;
  rating: number;
  comment: string | null;
  reviewerDisplayName: string | null;
  hostReply: string | null;
  hostRepliedAt: string | null;
  isVerified: boolean;
  createdAt: string;
};

export function fetchHostDashboard(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.getHostDashboard({})) as Promise<HostDashboardStats>;
}

export function fetchHostBookings(
  accessToken: string,
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "upcoming" | "today",
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listHostBookings(
      create(ListHostBookingsRequestSchema, status ? { status } : {}),
    );
    return response.bookings as BookingSummary[];
  });
}

export function fetchHostBooking(accessToken: string, bookingId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getHostBooking(create(GetHostBookingRequestSchema, { bookingId })),
  ) as Promise<BookingSummary>;
}

export function fetchHostRevenue(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.getHostRevenue({})) as Promise<HostRevenueSummary>;
}

export function fetchHostReviews(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listHostReviews({});
    return response.reviews as HostReviewSummary[];
  });
}

function hostBookingAction(accessToken: string, bookingId: string, action: "confirm" | "reject" | "markPaid" | "complete") {
  const client = createRoyalPassageClient(accessToken);
  const request = create(HostBookingActionRequestSchema, { bookingId });
  return rpcCall(() => {
    switch (action) {
      case "confirm":
        return client.confirmHostBooking(request);
      case "reject":
        return client.rejectHostBooking(request);
      case "markPaid":
        return client.markHostBookingPaid(request);
      case "complete":
        return client.completeHostBooking(request);
    }
  }) as Promise<BookingSummary>;
}

export function confirmHostBooking(accessToken: string, bookingId: string) {
  return hostBookingAction(accessToken, bookingId, "confirm");
}

export function rejectHostBooking(accessToken: string, bookingId: string) {
  return hostBookingAction(accessToken, bookingId, "reject");
}

export function markHostBookingPaid(accessToken: string, bookingId: string) {
  return hostBookingAction(accessToken, bookingId, "markPaid");
}

export function completeHostBooking(accessToken: string, bookingId: string) {
  return hostBookingAction(accessToken, bookingId, "complete");
}
