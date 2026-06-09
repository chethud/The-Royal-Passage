import { create } from "@bufbuild/protobuf";
import type { UserRole } from "@/lib/roles";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { AdminExperienceActionRequestSchema } from "@/gen/royalpassage/v1/service_pb";
import { CreateHostRequestSchema } from "@/gen/royalpassage/v1/types_pb";

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
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminUsers({});
    return response.users as ManagedUser[];
  });
}

export type CreateHostPayload = {
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
};

export function createHost(accessToken: string, payload: CreateHostPayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.createHost(create(CreateHostRequestSchema, payload)));
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
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminExperiences({});
    return response.experiences as AdminExperienceSummary[];
  });
}

export function publishExperience(accessToken: string, experienceId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.publishExperience(create(AdminExperienceActionRequestSchema, { experienceId })),
  ) as Promise<AdminExperienceSummary>;
}

export function rejectExperience(accessToken: string, experienceId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.rejectExperience(create(AdminExperienceActionRequestSchema, { experienceId })),
  ) as Promise<AdminExperienceSummary>;
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
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.getAdminStats({})) as Promise<AdminStats>;
}

export function fetchAdminBookings(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminBookings({});
    return response.bookings as AdminBookingRow[];
  });
}

export function fetchAdminActivity(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminActivity({});
    return response.entries as AuditLogEntry[];
  });
}
