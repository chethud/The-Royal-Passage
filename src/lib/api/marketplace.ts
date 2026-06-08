import type { Experience } from "@/data/experiences";
import { apiFetch } from "@/lib/api/client";

export type CatalogPayload = {
  mode: "live" | "static";
  experiences: Experience[];
  categories: string[];
  cities: string[];
};

export type ExperienceDetailPayload = {
  exp: Experience;
  source: "live" | "static";
};

export function fetchCatalog() {
  return apiFetch<CatalogPayload>("/api/v1/catalog");
}

export function fetchExperienceBySlug(slug: string) {
  return apiFetch<ExperienceDetailPayload>(`/api/v1/experiences/${encodeURIComponent(slug)}`);
}

export type CreateBookingPayload = {
  slotId: string;
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
};

export type CreateBookingResult = {
  bookingId: string;
  subtotalMinor: number;
  status: string;
};

export function createBooking(payload: CreateBookingPayload) {
  return apiFetch<CreateBookingResult>("/api/v1/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
