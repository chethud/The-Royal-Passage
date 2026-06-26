import type { BookingSummary } from "@/lib/api/bookings";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { normalizeBookingSummary } from "@/lib/booking-normalize";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type HistoryStatus = "upcoming" | "past" | "cancelled";

function currencySymbol(code: string | null | undefined): string {
  if (code === "EUR") return "€";
  if (code === "USD") return "$";
  return "₹";
}

function formatTime(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapExperienceBooking(row: Record<string, unknown>): BookingSummary {
  const exp = (row.experiences as Record<string, unknown> | null) ?? {};
  const hostRaw = exp.hosts;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  const hostRecord = (host as Record<string, unknown> | null) ?? {};
  const slot = (row.experience_slots as Record<string, unknown> | null) ?? {};
  const currency = String(row.currency_code ?? "INR");

  return normalizeBookingSummary({
    id: String(row.id ?? ""),
    experience: {
      id: String(exp.id ?? ""),
      slug: String(exp.slug ?? ""),
      title: String(exp.title ?? "Experience"),
      city: String(exp.city ?? ""),
      address: String(exp.address ?? ""),
      image: String(exp.hero_image_url ?? ""),
      hostName: String(hostRecord.display_name ?? "Host"),
    },
    slot: {
      id: String(slot.id ?? ""),
      date: String(slot.slot_date ?? "").slice(0, 10),
      start: formatTime(String(slot.start_time ?? "")) ?? "",
      end: formatTime(String(slot.end_time ?? "")) ?? "",
    },
    participantCount: Number(row.participant_count ?? row.guest_count ?? 1),
    totalAmount: Number(row.total_amount ?? row.subtotal_minor ?? 0),
    currencyCode: currency,
    currencySymbol: currencySymbol(currency),
    bookingStatus: String(row.booking_status ?? "pending"),
    paymentStatus: String(row.payment_status ?? "pending"),
    paymentMethod: String(row.payment_method ?? "cod"),
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    confirmedAt: (row.confirmed_at as string | null) ?? null,
    guestName: (row.guest_name as string | null) ?? null,
    guestEmail: (row.guest_email as string | null) ?? null,
    guestPhone: (row.guest_phone as string | null) ?? null,
    isPaused: Boolean(row.is_paused),
    pausedAt: (row.paused_at as string | null) ?? null,
  });
}

function mapHomestayBooking(row: Record<string, unknown>): HomestayBookingSummary {
  const stay = (row.homestays as Record<string, unknown> | null) ?? {};
  const roomRaw = row.homestay_rooms;
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
  const roomRecord = (room as Record<string, unknown> | null) ?? {};
  const currency = String(row.currency_code ?? "INR");
  const checkIn = String(row.check_in ?? "").slice(0, 10);
  const checkOut = String(row.check_out ?? "").slice(0, 10);
  const nights =
    Number(row.nights) ||
    Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000));

  return {
    id: String(row.id ?? ""),
    homestayId: String(stay.id ?? row.homestay_id ?? ""),
    homestayTitle: String(stay.title ?? "Homestay"),
    homestaySlug: String(stay.slug ?? ""),
    roomName: (roomRecord.name as string | null) ?? null,
    checkIn,
    checkOut,
    nights,
    guestCount: Number(row.guest_count ?? 1),
    totalAmount: Number(row.total_amount ?? 0),
    currencyCode: currency,
    currencySymbol: currencySymbol(currency),
    bookingStatus: String(row.booking_status ?? "pending"),
    paymentStatus: String(row.payment_status ?? "pending"),
    paymentMethod: String(row.payment_method ?? "cod"),
    guestName: null,
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    checkInTime: formatTime(String(stay.check_in_time ?? "")),
    checkOutTime: formatTime(String(stay.check_out_time ?? "")),
    homestayAddress: (stay.address as string | null) ?? null,
  };
}

function filterExperienceBookings(bookings: BookingSummary[], status: HistoryStatus): BookingSummary[] {
  const today = todayIso();
  if (status === "cancelled") {
    return bookings.filter((booking) => booking.bookingStatus === "cancelled");
  }
  if (status === "past") {
    return bookings.filter((booking) => booking.bookingStatus === "completed");
  }
  return bookings.filter(
    (booking) =>
      (booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") &&
      booking.slot.date >= today,
  );
}

function filterHomestayBookings(
  bookings: HomestayBookingSummary[],
  status: HistoryStatus,
): HomestayBookingSummary[] {
  const today = todayIso();
  if (status === "cancelled") {
    return bookings.filter((booking) => booking.bookingStatus === "cancelled");
  }
  if (status === "past") {
    return bookings.filter((booking) => booking.bookingStatus === "completed");
  }
  return bookings.filter(
    (booking) =>
      (booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") &&
      booking.checkOut >= today,
  );
}

export async function fetchGuestExperienceBookingsFromSupabase(
  status: HistoryStatus,
): Promise<BookingSummary[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      experience_slots ( id, slot_date, start_time, end_time ),
      experiences (
        id, slug, title, city, address, hero_image_url,
        hosts ( display_name )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const mapped = (data ?? []).map((row) => mapExperienceBooking(row as Record<string, unknown>));
  return filterExperienceBookings(mapped, status);
}

export async function fetchGuestHomestayBookingsFromSupabase(
  status: HistoryStatus,
): Promise<HomestayBookingSummary[]> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("homestay_bookings")
    .select(
      `
      *,
      homestays ( id, slug, title, check_in_time, check_out_time, address ),
      homestay_rooms ( name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const mapped = (data ?? []).map((row) => mapHomestayBooking(row as Record<string, unknown>));
  return filterHomestayBookings(mapped, status);
}

export async function loadGuestBookingHistory() {
  const [upcomingExperiences, pastExperiences, cancelledExperiences, homestayUpcoming, homestayPast, homestayCancelled] =
    await Promise.all([
      fetchGuestExperienceBookingsFromSupabase("upcoming"),
      fetchGuestExperienceBookingsFromSupabase("past"),
      fetchGuestExperienceBookingsFromSupabase("cancelled"),
      fetchGuestHomestayBookingsFromSupabase("upcoming"),
      fetchGuestHomestayBookingsFromSupabase("past"),
      fetchGuestHomestayBookingsFromSupabase("cancelled"),
    ]);

  const pastAndCancelledExperiences = [...pastExperiences, ...cancelledExperiences].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const pastAndCancelledHomestays = [...homestayPast, ...homestayCancelled].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    activeBookings: upcomingExperiences,
    activeHomestayBookings: homestayUpcoming,
    bookings: pastAndCancelledExperiences,
    homestayBookings: pastAndCancelledHomestays,
  };
}
