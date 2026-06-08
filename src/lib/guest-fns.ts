import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  fetchGuestProfile,
  updateGuestProfile,
  type GuestProfile,
  type UpdateGuestProfilePayload,
} from "@/lib/api/guest";

export type { GuestProfile };

const tokenSchema = z.object({ accessToken: z.string().min(1) });

export const getGuestProfile = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<GuestProfile> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchGuestProfile(data.accessToken);
  });

export const patchGuestProfile = createServerFn({ method: "POST" })
  .inputValidator(
    tokenSchema.extend({
      fullName: z.string().min(1).max(120).optional(),
      phone: z.string().max(30).optional(),
    }),
  )
  .handler(async ({ data }): Promise<GuestProfile> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    const payload: UpdateGuestProfilePayload = {};
    if (data.fullName !== undefined) payload.fullName = data.fullName;
    if (data.phone !== undefined) payload.phone = data.phone;
    return updateGuestProfile(data.accessToken, payload);
  });
