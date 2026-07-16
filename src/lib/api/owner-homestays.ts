import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  CreateOwnerHomestayRoomInputSchema,
  DeleteOwnerAvailabilityRequestSchema,
  DeleteOwnerHomestayRequestSchema,
  DeleteOwnerHomestayRoomRequestSchema,
  GetOwnerHomestayRequestSchema,
  UpdateOwnerHomestayInputSchema,
  UpdateOwnerHomestayRoomInputSchema,
  UpsertOwnerAvailabilityInputSchema,
} from "@/gen/royalpassage/v1/service_pb";
import {
  CreateOwnerHomestayRequestSchema,
  CreateOwnerHomestayRoomRequestSchema,
  UpdateOwnerHomestayRequestSchema,
  UpdateOwnerHomestayRoomRequestSchema,
  UpsertOwnerAvailabilityRequestSchema,
} from "@/gen/royalpassage/v1/types_pb";

export const HOMESTAY_PROPERTY_TYPES = [
  "Home Stay",
  "Resort",
  "Hotel",
] as const;

export type OwnerHomestayRoom = {
  id: string;
  name: string;
  category: string | null;
  capacity: number;
  pricePerNightMinor: number;
  weekendPricePerNightMinor?: number | null;
  totalUnits: number;
  amenities: string[];
  sortOrder: number;
  isActive: boolean;
  extraBedAvailable: boolean;
  extraBedPricePerNightMinor: number;
  extraBedWeekendPricePerNightMinor: number;
  extraBedsPerRoom: number;
};

export type OwnerHomestayAvailability = {
  id: string;
  date: string;
  roomId: string | null;
  isBlocked: boolean;
  priceOverrideMinor: number | null;
  minNights: number | null;
  note: string | null;
  extraBedPriceOverrideMinor: number | null;
};

export type OwnerHomestaySummary = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  pricePerNightMinor: number;
  currencySymbol: string;
  roomCount: number;
  image: string | null;
};

export type OwnerHomestayDetail = {
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
  compareAtPricePerNightMinor?: number | null;
  compareAtWeekendPricePerNightMinor?: number | null;
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
  availability: OwnerHomestayAvailability[];
  createdAt: string;
  updatedAt: string;
  extraBedAvailable: boolean;
  extraBedPricePerNightMinor: number;
  extraBedWeekendPricePerNightMinor: number;
  extraBedsPerRoom: number;
  licenseCertificateUrl: string | null;
};

export type CreateOwnerHomestayPayload = {
  title: string;
  slug?: string;
  tagline?: string;
  description: string;
  propertyType: string;
  citySlug: string;
  city?: string;
  region?: string;
  address?: string;
  mapLink?: string;
  pricePerNightMinor: number;
  weekendPricePerNightMinor?: number;
  compareAtPricePerNightMinor?: number | null;
  compareAtWeekendPricePerNightMinor?: number | null;
  heroImageUrl?: string;
  galleryUrls?: string[];
  amenities?: string[];
  houseRules?: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  checkInTime?: string;
  checkOutTime?: string;
  submitForReview?: boolean;
  extraBedAvailable?: boolean;
  extraBedPricePerNightMinor?: number;
  extraBedWeekendPricePerNightMinor?: number;
  extraBedsPerRoom?: number;
  licenseCertificateUrl: string;
};

export type UpdateOwnerHomestayPayload = Partial<CreateOwnerHomestayPayload>;

export function fetchOwnerHomestays(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listOwnerHomestays({});
    return response.homestays as OwnerHomestaySummary[];
  });
}

export function fetchOwnerHomestay(accessToken: string, homestayId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.getOwnerHomestay(create(GetOwnerHomestayRequestSchema, { homestayId })),
  ) as Promise<OwnerHomestayDetail>;
}

export function createOwnerHomestay(accessToken: string, payload: CreateOwnerHomestayPayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createOwnerHomestay(create(CreateOwnerHomestayRequestSchema, payload)),
  ) as Promise<OwnerHomestayDetail>;
}

export function updateOwnerHomestay(
  accessToken: string,
  homestayId: string,
  payload: UpdateOwnerHomestayPayload,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.updateOwnerHomestay(
      create(UpdateOwnerHomestayInputSchema, {
        homestayId,
        homestay: create(UpdateOwnerHomestayRequestSchema, payload),
      }),
    ),
  ) as Promise<OwnerHomestayDetail>;
}

export function deleteOwnerHomestay(accessToken: string, homestayId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.deleteOwnerHomestay(create(DeleteOwnerHomestayRequestSchema, { homestayId })),
  );
}

export function createOwnerHomestayRoom(
  accessToken: string,
  homestayId: string,
  payload: {
    name: string;
    category?: string;
    capacity: number;
    pricePerNightMinor: number;
    weekendPricePerNightMinor?: number;
    totalUnits?: number;
    amenities?: string[];
    sortOrder?: number;
    extraBedAvailable?: boolean;
    extraBedPricePerNightMinor?: number;
    extraBedWeekendPricePerNightMinor?: number;
    extraBedsPerRoom?: number;
  },
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createOwnerHomestayRoom(
      create(CreateOwnerHomestayRoomInputSchema, {
        homestayId,
        room: create(CreateOwnerHomestayRoomRequestSchema, payload),
      }),
    ),
  ) as Promise<OwnerHomestayDetail>;
}

export function updateOwnerHomestayRoom(
  accessToken: string,
  homestayId: string,
  roomId: string,
  payload: Partial<{
    name: string;
    category: string;
    capacity: number;
    pricePerNightMinor: number;
    weekendPricePerNightMinor?: number;
    totalUnits: number;
    amenities: string[];
    sortOrder: number;
    isActive: boolean;
    extraBedAvailable: boolean;
    extraBedPricePerNightMinor: number;
    extraBedWeekendPricePerNightMinor: number;
    extraBedsPerRoom: number;
  }>,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.updateOwnerHomestayRoom(
      create(UpdateOwnerHomestayRoomInputSchema, {
        homestayId,
        roomId,
        room: create(UpdateOwnerHomestayRoomRequestSchema, payload),
      }),
    ),
  ) as Promise<OwnerHomestayDetail>;
}

export function deleteOwnerHomestayRoom(accessToken: string, homestayId: string, roomId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.deleteOwnerHomestayRoom(
      create(DeleteOwnerHomestayRoomRequestSchema, { homestayId, roomId }),
    ),
  ) as Promise<OwnerHomestayDetail>;
}

export function upsertOwnerAvailability(
  accessToken: string,
  homestayId: string,
  payload: {
    date: string;
    roomId?: string;
    isBlocked?: boolean;
    priceOverrideMinor?: number;
    minNights?: number;
    note?: string;
    extraBedPriceOverrideMinor?: number;
  },
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.upsertOwnerAvailability(
      create(UpsertOwnerAvailabilityInputSchema, {
        homestayId,
        availability: create(UpsertOwnerAvailabilityRequestSchema, payload),
      }),
    ),
  ) as Promise<OwnerHomestayDetail>;
}

export function deleteOwnerAvailability(
  accessToken: string,
  homestayId: string,
  availabilityId: string,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.deleteOwnerAvailability(
      create(DeleteOwnerAvailabilityRequestSchema, { homestayId, availabilityId }),
    ),
  ) as Promise<OwnerHomestayDetail>;
}
