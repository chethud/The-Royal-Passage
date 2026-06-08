import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  cancelBooking,
  createBooking,
  fetchBookingById,
  fetchMyBookings,
  type BookingSummary,
} from "@/lib/api/bookings";
import { isApiConfigured } from "@/lib/api/client";

export type { BookingSummary };

const tokenSchema = z.object({ accessToken: z.string().min(1) });

const createBookingSchema = tokenSchema.extend({
  slotId: z.string().min(1),
  guestCount: z.number().int().min(1).max(50),
  notes: z.string().max(500).optional(),
});

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator(createBookingSchema)
  .handler(async ({ data }) => {
    if (!isApiConfigured()) {
      throw new Error("Booking API is not configured. Set VITE_API_BASE_URL.");
    }
    return createBooking(data.accessToken, {
      slotId: data.slotId,
      guestCount: data.guestCount,
      notes: data.notes,
    });
  });

export const listMyBookings = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      status: z.enum(["upcoming", "past", "cancelled"]).optional(),
    }),
  )
  .handler(async ({ data }): Promise<BookingSummary[]> => {
    if (!isApiConfigured()) {
      throw new Error("Booking API is not configured. Set VITE_API_BASE_URL.");
    }
    return fetchMyBookings(data.accessToken, data.status);
  });

export const getBookingDetail = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) {
      throw new Error("Booking API is not configured. Set VITE_API_BASE_URL.");
    }
    return fetchBookingById(data.accessToken, data.bookingId);
  });

export const cancelMyBooking = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<BookingSummary> => {
    if (!isApiConfigured()) {
      throw new Error("Booking API is not configured. Set VITE_API_BASE_URL.");
    }
    return cancelBooking(data.accessToken, data.bookingId);
  });
