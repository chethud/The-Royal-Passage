import type { BookingSummary } from "@/lib/api/bookings";
import { apiFetch } from "@/lib/api/client";

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
  totalBookings: number;
  currencySymbol: string;
};

export const EMPTY_HOST_DASHBOARD_STATS: HostDashboardStats = {
  pendingBookings: 0,
  confirmedBookings: 0,
  completedBookings: 0,
  revenueCollectedMinor: 0,
  revenuePendingMinor: 0,
  weekRevenueEstimateMinor: 0,
  upcomingBookings: 0,
  todayBookings: 0,
  publishedExperiences: 0,
  totalBookings: 0,
  currencySymbol: "₹",
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
  return apiFetch<HostDashboardStats>("/api/v1/host/dashboard", { accessToken });
}

export function fetchHostBookings(
  accessToken: string,
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "upcoming" | "today",
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<BookingSummary[]>(`/api/v1/host/bookings${query}`, { accessToken });
}

export function fetchHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}`, { accessToken });
}

export function fetchHostRevenue(accessToken: string) {
  return apiFetch<HostRevenueSummary>("/api/v1/host/revenue", { accessToken });
}

export function fetchHostReviews(accessToken: string) {
  return apiFetch<HostReviewSummary[]>("/api/v1/host/reviews", { accessToken });
}

export type HostBookingDecisionPayload = {
  decisionName: string;
  decisionPhone: string;
  rejectionReason?: string;
};

export function confirmHostBooking(
  accessToken: string,
  bookingId: string,
  decision: HostBookingDecisionPayload,
) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/confirm`, {
    accessToken,
    method: "POST",
    body: JSON.stringify({
      decisionName: decision.decisionName,
      decisionPhone: decision.decisionPhone,
    }),
  });
}

export function rejectHostBooking(
  accessToken: string,
  bookingId: string,
  decision: HostBookingDecisionPayload,
) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/reject`, {
    accessToken,
    method: "POST",
    body: JSON.stringify({
      decisionName: decision.decisionName,
      decisionPhone: decision.decisionPhone,
      rejectionReason: decision.rejectionReason,
    }),
  });
}

export function markHostBookingPaid(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/mark-paid`, {
    accessToken,
    method: "POST",
  });
}

export function completeHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/complete`, {
    accessToken,
    method: "POST",
  });
}

export function pauseHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/pause`, {
    accessToken,
    method: "POST",
  });
}

export function resumeHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/resume`, {
    accessToken,
    method: "POST",
  });
}
