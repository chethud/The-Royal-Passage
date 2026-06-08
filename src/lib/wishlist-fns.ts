import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  addWishlistItem,
  fetchWishlist,
  removeWishlistItem,
  type WishlistItem,
} from "@/lib/api/wishlist";

export type { WishlistItem };

const tokenSchema = z.object({ accessToken: z.string().min(1) });

export const listWishlist = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema)
  .handler(async ({ data }): Promise<WishlistItem[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchWishlist(data.accessToken);
  });

export const saveWishlistItem = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ experienceId: z.string().min(1) }))
  .handler(async ({ data }): Promise<WishlistItem> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return addWishlistItem(data.accessToken, data.experienceId);
  });

export const deleteWishlistItem = createServerFn({ method: "POST" })
  .inputValidator(tokenSchema.extend({ experienceId: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return removeWishlistItem(data.accessToken, data.experienceId);
  });
