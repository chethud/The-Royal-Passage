import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  GetOwnerVipPackageRequestSchema,
  UpdateOwnerVipPackageInputSchema,
} from "@/gen/royalpassage/v1/service_pb";
import {
  CreateOwnerVipPackageRequestSchema,
  UpdateOwnerVipPackageRequestSchema,
} from "@/gen/royalpassage/v1/types_pb";

export const VIP_OWNER_PACKAGE_TYPES = [
  "Palace Experience",
  "Heritage Circuit",
  "Wellness Retreat",
  "Culinary Journey",
  "Private Celebration",
] as const;

export type OwnerVipPackageSummary = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  priceFromMinor: number;
  currencySymbol: string;
  durationDays: number;
  image: string | null;
  packageType: string;
};

export type OwnerVipPackageDetail = {
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
};

export type CreateOwnerVipPackagePayload = {
  title: string;
  slug?: string;
  tagline?: string;
  description: string;
  packageType: string;
  citySlug: string;
  city?: string;
  region?: string;
  priceFromMinor: number;
  heroImageUrl?: string;
  galleryUrls?: string[];
  highlights?: string[];
  conciergeNote?: string;
  durationDays?: number;
  maxGuests?: number;
  submitForReview?: boolean;
};

export type UpdateOwnerVipPackagePayload = Partial<CreateOwnerVipPackagePayload>;

export function fetchOwnerVipPackages(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listOwnerVipPackages({});
    return response.packages as OwnerVipPackageSummary[];
  });
}

export function fetchOwnerVipPackage(accessToken: string, packageId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getOwnerVipPackage(create(GetOwnerVipPackageRequestSchema, { packageId })),
  ) as Promise<OwnerVipPackageDetail>;
}

export function createOwnerVipPackage(accessToken: string, payload: CreateOwnerVipPackagePayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createOwnerVipPackage(create(CreateOwnerVipPackageRequestSchema, payload)),
  ) as Promise<OwnerVipPackageDetail>;
}

export function updateOwnerVipPackage(
  accessToken: string,
  packageId: string,
  payload: UpdateOwnerVipPackagePayload,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.updateOwnerVipPackage(
      create(UpdateOwnerVipPackageInputSchema, {
        packageId,
        package: create(UpdateOwnerVipPackageRequestSchema, payload),
      }),
    ),
  ) as Promise<OwnerVipPackageDetail>;
}
