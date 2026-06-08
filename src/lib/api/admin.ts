import type { UserRole } from "@/lib/roles";
import { apiFetch } from "@/lib/api/client";

export type ManagedUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  hostId: string | null;
  createdAt: string;
};

export function fetchManagedUsers(accessToken: string) {
  return apiFetch<ManagedUser[]>("/api/v1/admin/users", { accessToken });
}

export type CreateHostPayload = {
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
};

export function createHost(accessToken: string, payload: CreateHostPayload) {
  return apiFetch<{ id: string; email: string; displayName: string; hostId: string }>(
    "/api/v1/admin/hosts",
    {
      method: "POST",
      accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export type AdminExperienceSummary = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  hostName: string;
  createdAt: string;
};

export function fetchPendingExperiences(accessToken: string) {
  return apiFetch<AdminExperienceSummary[]>("/api/v1/admin/experiences", { accessToken });
}

export function publishExperience(accessToken: string, experienceId: string) {
  return apiFetch<AdminExperienceSummary>(`/api/v1/admin/experiences/${experienceId}/publish`, {
    method: "POST",
    accessToken,
  });
}

export function rejectExperience(accessToken: string, experienceId: string) {
  return apiFetch<AdminExperienceSummary>(`/api/v1/admin/experiences/${experienceId}/reject`, {
    method: "POST",
    accessToken,
  });
}

export type AdminStats = {
  totalGuests: number;
  totalHosts: number;
  publishedExperiences: number;
  totalBookings: number;
  revenueCollectedMinor: number;
  pendingExperienceReviews: number;
  currencySymbol: string;
};

export type AdminBookingRow = {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  experienceTitle: string;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currencySymbol: string;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export function fetchAdminStats(accessToken: string) {
  return apiFetch<AdminStats>("/api/v1/admin/stats", { accessToken });
}

export function fetchAdminBookings(accessToken: string) {
  return apiFetch<AdminBookingRow[]>("/api/v1/admin/bookings", { accessToken });
}

export function fetchAdminActivity(accessToken: string) {
  return apiFetch<AuditLogEntry[]>("/api/v1/admin/activity", { accessToken });
}
