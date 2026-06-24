import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { AdminVipPackageActionRequestSchema } from "@/gen/royalpassage/v1/service_pb";

export type AdminVipPackageSummary = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  ownerName: string;
  createdAt: string;
  packageType: string;
};

export type AdminVipPackageDetail = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  packageType: string;
  city: string;
  citySlug: string | null;
  region: string | null;
  priceFromMinor: number;
  status: string;
  heroImageUrl: string | null;
  galleryUrls: string[];
  highlights: string[];
  conciergeNote: string | null;
  durationDays: number;
  maxGuests: number;
  currencyCode: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  ownerVerified: boolean;
};

export function fetchAdminVipPackageApprovals(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminVipPackages({});
    return response.packages as AdminVipPackageSummary[];
  });
}

export function fetchAdminVipPackage(accessToken: string, packageId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getAdminVipPackage(create(AdminVipPackageActionRequestSchema, { packageId })),
  ) as Promise<AdminVipPackageDetail>;
}

export function publishVipPackage(accessToken: string, packageId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.publishVipPackage(create(AdminVipPackageActionRequestSchema, { packageId })),
  ) as Promise<AdminVipPackageSummary>;
}

export function rejectVipPackage(accessToken: string, packageId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.rejectVipPackage(create(AdminVipPackageActionRequestSchema, { packageId })),
  ) as Promise<AdminVipPackageSummary>;
}
