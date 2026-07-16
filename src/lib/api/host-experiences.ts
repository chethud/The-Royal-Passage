import { apiFetch } from "@/lib/api/client";

export type CategoryOption = { slug: string; label: string };

export type HostSlotDetail = {
  id: string;
  date: string;
  start: string;
  end: string;
  capacity: number;
  seatsSold: number;
  available: number;
  isBlocked: boolean;
};

export type HostExperienceSummary = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  pricePerPersonMinor: number;
  compareAtPricePerPersonMinor?: number | null;
  currencySymbol: string;
  slotCount: number;
  image: string | null;
};

export type HostExperienceDetail = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  categorySlug: string;
  categoryLabel: string;
  city: string;
  citySlug: string | null;
  region: string | null;
  address: string | null;
  mapLink: string | null;
  durationMinutes: number;
  pricePerPersonMinor: number;
  compareAtPricePerPersonMinor?: number | null;
  status: string;
  heroImageUrl: string | null;
  galleryUrls: string[];
  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  cancellationPolicy: string | null;
  minGuestsPerBooking: number;
  maxGuestsPerBooking: number;
  currencyCode: string;
  currencySymbol: string;
  slots: HostSlotDetail[];
  createdAt: string;
  updatedAt: string;
};

export type CreateHostExperiencePayload = {
  title: string;
  slug?: string;
  tagline?: string;
  description: string;
  categorySlug: string;
  citySlug: string;
  city?: string;
  region?: string;
  address?: string;
  mapLink?: string;
  durationMinutes: number;
  pricePerPersonMinor: number;
  compareAtPricePerPersonMinor?: number | null;
  heroImageUrl?: string;
  galleryUrls?: string[];
  inclusions?: string[];
  exclusions?: string[];
  requirements?: string[];
  cancellationPolicy?: string;
  minGuestsPerBooking?: number;
  maxGuestsPerBooking?: number;
  submitForReview?: boolean;
};

export type UpdateHostExperiencePayload = Partial<CreateHostExperiencePayload>;

export type CreateHostSlotPayload = {
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
};

export type UpdateHostSlotPayload = {
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  isBlocked?: boolean;
};

export function fetchHostCategories(accessToken: string) {
  return apiFetch<CategoryOption[]>("/api/v1/host/categories", { accessToken });
}

export function fetchHostExperiences(accessToken: string) {
  return apiFetch<HostExperienceSummary[]>("/api/v1/host/experiences", { accessToken });
}

export function fetchHostExperience(accessToken: string, experienceId: string) {
  return apiFetch<HostExperienceDetail>(`/api/v1/host/experiences/${experienceId}`, {
    accessToken,
  });
}

export function createHostExperience(accessToken: string, payload: CreateHostExperiencePayload) {
  return apiFetch<HostExperienceDetail>("/api/v1/host/experiences", {
    accessToken,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateHostExperience(
  accessToken: string,
  experienceId: string,
  payload: UpdateHostExperiencePayload,
) {
  return apiFetch<HostExperienceDetail>(`/api/v1/host/experiences/${experienceId}`, {
    accessToken,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteHostExperience(accessToken: string, experienceId: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/host/experiences/${experienceId}`, {
    accessToken,
    method: "DELETE",
  });
}

export function createHostSlot(
  accessToken: string,
  experienceId: string,
  payload: CreateHostSlotPayload,
) {
  return apiFetch<HostExperienceDetail>(
    `/api/v1/host/experiences/${experienceId}/slots`,
    {
      accessToken,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateHostSlot(
  accessToken: string,
  experienceId: string,
  slotId: string,
  payload: UpdateHostSlotPayload,
) {
  return apiFetch<HostExperienceDetail>(
    `/api/v1/host/experiences/${experienceId}/slots/${slotId}`,
    {
      accessToken,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteHostSlot(accessToken: string, experienceId: string, slotId: string) {
  return apiFetch<HostExperienceDetail>(
    `/api/v1/host/experiences/${experienceId}/slots/${slotId}`,
    {
      accessToken,
      method: "DELETE",
    },
  );
}
