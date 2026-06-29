import { create } from "@bufbuild/protobuf";
import type { UserRole } from "@/lib/roles";
import { fetchBookingById } from "@/lib/api/bookings";
import { apiFetch } from "@/lib/api/client";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { CreateHostRequestSchema, CreateHomestayOwnerRequestSchema, CreatePlatformUserRequestSchema, CreateVipOwnerRequestSchema } from "@/gen/royalpassage/v1/types_pb";
import type { HostSlotDetail } from "@/lib/api/host-experiences";

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
  return apiFetch("/api/v1/admin/hosts", {
    accessToken,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type CreatePlatformUserPayload = {
  role: "host" | "homestay_owner" | "vip_owner" | "admin" | "editor";
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
  address?: string;
};

export function createPlatformUser(accessToken: string, payload: CreatePlatformUserPayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createPlatformUser(create(CreatePlatformUserRequestSchema, payload)),
  );
}

export type CreateHomestayOwnerPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export function createHomestayOwner(accessToken: string, payload: CreateHomestayOwnerPayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createHomestayOwner(create(CreateHomestayOwnerRequestSchema, payload)),
  );
}

export type CreateVipOwnerPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export function createVipOwner(accessToken: string, payload: CreateVipOwnerPayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createVipOwner(create(CreateVipOwnerRequestSchema, payload)),
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

export type AdminExperienceDetail = {
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
  hostName: string;
  hostEmail: string | null;
  hostPhone: string | null;
  hostBio: string | null;
  hostVerified: boolean;
};

export function fetchAdminExperienceApprovals(accessToken: string) {
  return apiFetch<AdminExperienceSummary[]>("/api/v1/admin/experiences", { accessToken });
}

/** @deprecated Use fetchAdminExperienceApprovals */
export function fetchPendingExperiences(accessToken: string) {
  return fetchAdminExperienceApprovals(accessToken);
}

export function fetchAdminExperience(accessToken: string, experienceId: string) {
  return apiFetch<AdminExperienceDetail>(`/api/v1/admin/experiences/${experienceId}`, {
    accessToken,
  });
}

export function publishExperience(accessToken: string, experienceId: string) {
  return apiFetch<AdminExperienceSummary>(
    `/api/v1/admin/experiences/${experienceId}/publish`,
    { accessToken, method: "POST" },
  );
}

export function rejectExperience(accessToken: string, experienceId: string) {
  return apiFetch<AdminExperienceSummary>(
    `/api/v1/admin/experiences/${experienceId}/reject`,
    { accessToken, method: "POST" },
  );
}

export type AdminStats = {
  totalGuests: number;
  totalHosts: number;
  publishedExperiences: number;
  totalBookings: number;
  revenueCollectedMinor: number;
  pendingExperienceReviews: number;
  currencySymbol: string;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  grossBookingValueMinor: number;
  platformRevenueMinor: number;
  hostPayoutDueMinor: number;
  codPendingCollectionMinor: number;
  commissionPercent: number;
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
  slotDate: string;
  platformFeeMinor: number;
  hostPayoutMinor: number;
  hostName: string | null;
  isPaused?: boolean;
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
  return apiFetch<AdminBookingRow[]>("/api/v1/admin/bookings", { accessToken }).then((rows) =>
    rows.map(normalizeAdminBookingRow),
  );
}

function normalizeAdminBookingRow(raw: AdminBookingRow): AdminBookingRow {
  const createdAt = String(raw.createdAt ?? "");
  const slotDate = raw.slotDate?.trim() || createdAt.slice(0, 10);

  return {
    ...raw,
    createdAt,
    slotDate,
    platformFeeMinor: raw.platformFeeMinor ?? 0,
    hostPayoutMinor: raw.hostPayoutMinor ?? 0,
    isPaused: raw.isPaused ?? false,
    currencySymbol: raw.currencySymbol || "₹",
  };
}

export function fetchAdminBooking(accessToken: string, bookingId: string) {
  return fetchBookingById(accessToken, bookingId);
}

export function fetchAdminActivity(accessToken: string) {
  return apiFetch<AuditLogEntry[]>("/api/v1/admin/activity", { accessToken });
}
