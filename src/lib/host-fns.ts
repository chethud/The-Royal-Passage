import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  completeHostBooking,
  confirmHostBooking,
  fetchHostBooking,
  fetchHostBookings,
  fetchHostDashboard,
  fetchHostRevenue,
  fetchHostReviews,
  markHostBookingPaid,
  pauseHostBooking,
  rejectHostBooking,
  resumeHostBooking,
  type HostDashboardStats,
  type HostRevenueSummary,
  type HostReviewSummary,
} from "@/lib/api/host";

export type { HostDashboardStats, HostRevenueSummary, HostReviewSummary, BookingSummary };

const tokenSchema = z.object({ accessToken: z.string().min(1) });

export const getHostDashboard = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<HostDashboardStats> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostDashboard(data.accessToken);
  });

export const listHostBookings = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      status: z
        .enum(["pending", "confirmed", "completed", "cancelled", "upcoming", "today"])
        .optional(),
    }),
  )
  .handler(async ({ data }): Promise<BookingSummary[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostBookings(data.accessToken, data.status);
  });

export const getHostBookingDetail = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostBooking(data.accessToken, data.bookingId);
  });

export const getHostRevenue = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ period: z.enum(["month", "months_6", "year"]).optional() }))
  .handler(async ({ data }): Promise<HostRevenueSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostRevenue(data.accessToken, data.period ?? "month");
  });

export const listHostReviews = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<HostReviewSummary[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostReviews(data.accessToken);
  });

export const hostConfirmBooking = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return confirmHostBooking(data.accessToken, data.bookingId);
  });

export const hostRejectBooking = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return rejectHostBooking(data.accessToken, data.bookingId);
  });

export const hostMarkBookingPaid = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return markHostBookingPaid(data.accessToken, data.bookingId);
  });

export const hostCompleteBooking = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return completeHostBooking(data.accessToken, data.bookingId);
  });

export const hostPauseBooking = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return pauseHostBooking(data.accessToken, data.bookingId);
  });

export const hostResumeBooking = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return resumeHostBooking(data.accessToken, data.bookingId);
  });
