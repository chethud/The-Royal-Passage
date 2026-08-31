import { apiFetch } from "@/lib/api/client";

export type TravelAgentBookingSummary = {
  id: string;
  kind: "experience" | "homestay";
  title: string;
  slug: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  agentMarkupMinor: number;
  agentDiscountPercent: number | null;
  currencyCode: string;
  currencySymbol: string;
  createdAt: string;
  slotDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  guestCount: number | null;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
};

export type AdminTravelAgentBookingSummary = TravelAgentBookingSummary & {
  agentCompanyName: string | null;
  agentContactName: string | null;
  agentEmail: string | null;
};

export function fetchTravelAgentBookings(
  accessToken: string,
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "upcoming" | "today",
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<TravelAgentBookingSummary[]>(`/api/v1/travel-agent/bookings${query}`, {
    accessToken,
  });
}

export function fetchAdminTravelAgentBookings(
  accessToken: string,
  options?: { status?: string; limit?: number },
) {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<AdminTravelAgentBookingSummary[]>(
    `/api/v1/admin/travel-agent-bookings${query}`,
    { accessToken },
  );
}
