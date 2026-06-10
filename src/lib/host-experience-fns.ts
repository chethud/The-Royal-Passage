import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  createHostExperience,
  createHostSlot,
  deleteHostExperience,
  deleteHostSlot,
  fetchHostCategories,
  fetchHostExperience,
  fetchHostExperiences,
  updateHostExperience,
  updateHostSlot,
  type CategoryOption,
  type HostExperienceDetail,
  type HostExperienceSummary,
} from "@/lib/api/host-experiences";

export type { CategoryOption, HostExperienceDetail, HostExperienceSummary };

const tokenSchema = z.object({ accessToken: z.string().min(1) });

const experiencePayloadSchema = z.object({
  title: z.string().min(5).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(120).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().min(50).max(5000),
  categorySlug: z.string().min(1),
  citySlug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(64),
  city: z.string().min(2).max(80).optional(),
  region: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
  durationMinutes: z.number().int().min(30).max(480),
  pricePerPersonMinor: z.number().int().min(0),
  heroImageUrl: z.string().max(500).optional(),
  galleryUrls: z.array(z.string().max(500)).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  cancellationPolicy: z.string().max(1000).optional(),
  minGuestsPerBooking: z.number().int().min(1).max(50).optional(),
  maxGuestsPerBooking: z.number().int().min(1).max(50).optional(),
  submitForReview: z.boolean().optional(),
});

export const getHostCategories = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<CategoryOption[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostCategories(data.accessToken);
  });

export const listHostExperiences = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<HostExperienceSummary[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostExperiences(data.accessToken);
  });

export const getHostExperienceDetail = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ experienceId: z.string().min(1) }))
  .handler(async ({ data }): Promise<HostExperienceDetail> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchHostExperience(data.accessToken, data.experienceId);
  });

export const createHostExperienceFn = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend(experiencePayloadSchema.shape))
  .handler(async ({ data }): Promise<HostExperienceDetail> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    const { accessToken, ...payload } = data;
    return createHostExperience(accessToken, payload);
  });

export const updateHostExperienceFn = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      experienceId: z.string().min(1),
      ...experiencePayloadSchema.partial().shape,
    }),
  )
  .handler(async ({ data }): Promise<HostExperienceDetail> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    const { accessToken, experienceId, ...payload } = data;
    return updateHostExperience(accessToken, experienceId, payload);
  });

export const deleteHostExperienceFn = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ experienceId: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return deleteHostExperience(data.accessToken, data.experienceId);
  });

export const createHostSlotFn = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      experienceId: z.string().min(1),
      slotDate: z.string().min(1),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      capacity: z.number().int().min(1).max(100),
    }),
  )
  .handler(async ({ data }): Promise<HostExperienceDetail> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    const { accessToken, experienceId, slotDate, startTime, endTime, capacity } = data;
    return createHostSlot(accessToken, experienceId, {
      slotDate,
      startTime,
      endTime,
      capacity,
    });
  });

export const updateHostSlotFn = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      experienceId: z.string().min(1),
      slotId: z.string().min(1),
      slotDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      capacity: z.number().int().min(1).max(100).optional(),
      isBlocked: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }): Promise<HostExperienceDetail> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    const { accessToken, experienceId, slotId, ...payload } = data;
    return updateHostSlot(accessToken, experienceId, slotId, payload);
  });

export const deleteHostSlotFn = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      experienceId: z.string().min(1),
      slotId: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<HostExperienceDetail> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return deleteHostSlot(data.accessToken, data.experienceId, data.slotId);
  });
