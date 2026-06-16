import { create } from "@bufbuild/protobuf";
import { apiFetch } from "@/lib/api/client";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  DeleteHostExperienceRequestSchema,
  DeleteHostSlotRequestSchema,
  GetHostExperienceRequestSchema,
  UpdateHostExperienceInputSchema,
  UpdateHostSlotInputSchema,
} from "@/gen/royalpassage/v1/service_pb";
import {
  UpdateHostExperienceRequestSchema,
  UpdateHostSlotRequestSchema,
} from "@/gen/royalpassage/v1/types_pb";

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
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listHostCategories({});
    return response.categories as CategoryOption[];
  });
}

export function fetchHostExperiences(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listHostExperiences({});
    return response.experiences as HostExperienceSummary[];
  });
}

export function fetchHostExperience(accessToken: string, experienceId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getHostExperience(create(GetHostExperienceRequestSchema, { experienceId })),
  ) as Promise<HostExperienceDetail>;
}

export function createHostExperience(accessToken: string, payload: CreateHostExperiencePayload) {
  return apiFetch<HostExperienceDetail>("/api/v1/host/experiences", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateHostExperience(
  accessToken: string,
  experienceId: string,
  payload: UpdateHostExperiencePayload,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.updateHostExperience(
      create(UpdateHostExperienceInputSchema, {
        experienceId,
        experience: create(UpdateHostExperienceRequestSchema, payload),
      }),
    ),
  ) as Promise<HostExperienceDetail>;
}

export function deleteHostExperience(accessToken: string, experienceId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.deleteHostExperience(create(DeleteHostExperienceRequestSchema, { experienceId })),
  );
}

export function createHostSlot(
  accessToken: string,
  experienceId: string,
  payload: CreateHostSlotPayload,
) {
  return apiFetch<HostExperienceDetail>(`/api/v1/host/experiences/${experienceId}/slots`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateHostSlot(
  accessToken: string,
  experienceId: string,
  slotId: string,
  payload: UpdateHostSlotPayload,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.updateHostSlot(
      create(UpdateHostSlotInputSchema, {
        experienceId,
        slotId,
        slot: create(UpdateHostSlotRequestSchema, payload),
      }),
    ),
  ) as Promise<HostExperienceDetail>;
}

export function deleteHostSlot(accessToken: string, experienceId: string, slotId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.deleteHostSlot(create(DeleteHostSlotRequestSchema, { experienceId, slotId })),
  ) as Promise<HostExperienceDetail>;
}
