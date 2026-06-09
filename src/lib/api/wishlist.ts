import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  AddToWishlistRequestSchema,
  RemoveFromWishlistRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";

export type WishlistExperienceSummary = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  city: string;
  image: string;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  currencySymbol: string;
  hostName: string;
};

export type WishlistItem = {
  experienceId: string;
  savedAt: string;
  experience: WishlistExperienceSummary;
};

export function fetchWishlist(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listWishlist({});
    return response.items as WishlistItem[];
  });
}

export function addWishlistItem(accessToken: string, experienceId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.addToWishlist(create(AddToWishlistRequestSchema, { experienceId })),
  ) as Promise<WishlistItem>;
}

export function removeWishlistItem(accessToken: string, experienceId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.removeFromWishlist(create(RemoveFromWishlistRequestSchema, { experienceId })),
  );
}
