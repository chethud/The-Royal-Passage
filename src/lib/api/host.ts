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
  return apiFetch<HostDashboardStats>("/api/v1/host/dashboard", { accessToken });
}

export function fetchHostBookings(
  accessToken: string,
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "upcoming" | "today",
) {
  const query = status ? `?status=${status}` : "";
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

export function confirmHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/confirm`, {
    method: "POST",
    accessToken,
  });
}

export function rejectHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/reject`, {
    method: "POST",
    accessToken,
  });
}

export function markHostBookingPaid(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/mark-paid`, {
    method: "POST",
    accessToken,
  });
}

export function completeHostBooking(accessToken: string, bookingId: string) {
  return apiFetch<BookingSummary>(`/api/v1/host/bookings/${bookingId}/complete`, {
    method: "POST",
    accessToken,
  });
}
