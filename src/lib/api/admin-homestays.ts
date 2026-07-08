import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { AdminHomestayActionRequestSchema } from "@/gen/royalpassage/v1/service_pb";
import type { OwnerHomestayRoom } from "@/lib/api/owner-homestays";

export type AdminHomestaySummary = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  ownerName: string;
  createdAt: string;
};

export type AdminHomestayDetail = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  propertyType: string;
  city: string;
  citySlug: string | null;
  region: string | null;
  address: string | null;
  mapLink: string | null;
  pricePerNightMinor: number;
  weekendPricePerNightMinor?: number | null;
  status: string;
  heroImageUrl: string | null;
  galleryUrls: string[];
  amenities: string[];
  houseRules: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  currencyCode: string;
  currencySymbol: string;
  rooms: OwnerHomestayRoom[];
  createdAt: string;
  updatedAt: string;
  extraBedAvailable: boolean;
  extraBedPricePerNightMinor: number;
  extraBedWeekendPricePerNightMinor: number;
  extraBedsPerRoom: number;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  ownerVerified: boolean;
  licenseCertificateUrl: string | null;
};

export function fetchAdminHomestayApprovals(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminHomestays({});
    return response.homestays as AdminHomestaySummary[];
  });
}

export function fetchAdminHomestay(accessToken: string, homestayId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getAdminHomestay(create(AdminHomestayActionRequestSchema, { homestayId })),
  ) as Promise<AdminHomestayDetail>;
}

export function publishHomestay(accessToken: string, homestayId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.publishHomestay(create(AdminHomestayActionRequestSchema, { homestayId })),
  ) as Promise<AdminHomestaySummary>;
}

export function rejectHomestay(accessToken: string, homestayId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.rejectHomestay(create(AdminHomestayActionRequestSchema, { homestayId })),
  ) as Promise<AdminHomestaySummary>;
}
