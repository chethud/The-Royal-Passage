import { create } from "@bufbuild/protobuf";
import type { Homestay } from "@/data/homestays";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  GetHomestayBySlugRequestSchema,
  ListHomestaysRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";
import { mapProtoHomestay } from "@/lib/homestay-db";

export type HomestaysCatalogPayload = {
  mode: "live" | "static";
  homestays: Homestay[];
  propertyTypes: string[];
  cities: string[];
};

export type HomestayDetailPayload = {
  homestay: Homestay;
  source: "live" | "static";
};

export function fetchHomestays(citySlug?: string) {
  const client = createRoyalPassageClient();
  return rpcCall(async () => {
    const response = await client.listHomestays(
      create(ListHomestaysRequestSchema, citySlug ? { citySlug } : {}),
    );
    return {
      mode: (response.mode as "live" | "static") || "live",
      homestays: (response.homestays ?? []).map(mapProtoHomestay),
      propertyTypes: response.propertyTypes ?? [],
      cities: response.cities ?? [],
    } satisfies HomestaysCatalogPayload;
  });
}

export function fetchHomestayBySlug(slug: string) {
  const client = createRoyalPassageClient();
  return rpcCall(async () => {
    const payload = await client.getHomestayBySlug(
      create(GetHomestayBySlugRequestSchema, { slug }),
    );
    if (!payload.homestay) throw new Error("Homestay not found.");
    return {
      homestay: mapProtoHomestay(payload.homestay),
      source: (payload.source as "live" | "static") || "live",
    } satisfies HomestayDetailPayload;
  });
}
