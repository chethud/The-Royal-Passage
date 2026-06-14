import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  CancelBookingRequestSchema,
  GetBookingRequestSchema,
  ListMyBookingsRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";
import { CreateBookingRequestSchema } from "@/gen/royalpassage/v1/types_pb";
import { normalizeBookingSummary } from "@/lib/booking-normalize";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

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
  isPaused?: boolean;
  pausedAt?: string | null;
};

function normalizeCreateBookingResult(result: {
  bookingId: string;
  totalAmount: number;
  currencyCode: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
}): CreateBookingResult {
  return {
    bookingId: result.bookingId,
    totalAmount: result.totalAmount,
    currencyCode: result.currencyCode,
    bookingStatus: result.bookingStatus,
    paymentStatus: result.paymentStatus,
    paymentMethod: result.paymentMethod,
  };
}

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
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const result = await client.createBooking(
      create(CreateBookingRequestSchema, {
        slotId: payload.slotId,
        guestCount: payload.guestCount,
        notes: payload.notes,
      }),
    );
    return normalizeCreateBookingResult(result);
  });
}

export function fetchMyBookings(accessToken: string, status?: "upcoming" | "past" | "cancelled") {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listMyBookings(
      create(ListMyBookingsRequestSchema, status ? { status } : {}),
    );
    return mapBookings(response.bookings as BookingSummary[]);
  });
}

export function fetchBookingById(accessToken: string, bookingId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const row = (await client.getBooking(
      create(GetBookingRequestSchema, { bookingId }),
    )) as BookingSummary;
    return hydrateBookingExperienceSlug(row);
  });
}

export function cancelBooking(accessToken: string, bookingId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const row = (await client.cancelBooking(
      create(CancelBookingRequestSchema, { bookingId }),
    )) as BookingSummary;
    return hydrateBookingExperienceSlug(row);
  });
}
