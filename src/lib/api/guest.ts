import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { UpdateGuestProfileRequestSchema } from "@/gen/royalpassage/v1/types_pb";

export type GuestProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
};

export type UpdateGuestProfilePayload = {
  fullName?: string;
  phone?: string;
};

function normalizeGuestProfile(raw: {
  id?: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  role?: string;
  createdAt?: string;
}): GuestProfile {
  return {
    id: String(raw.id ?? ""),
    email: raw.email != null ? String(raw.email) : null,
    fullName: raw.fullName != null ? String(raw.fullName) : null,
    phone: raw.phone != null ? String(raw.phone) : null,
    role: String(raw.role ?? "guest"),
    createdAt: String(raw.createdAt ?? ""),
  };
}

export function fetchGuestProfile(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const result = await client.getGuestProfile({});
    return normalizeGuestProfile(result);
  });
}

export function updateGuestProfile(accessToken: string, payload: UpdateGuestProfilePayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const result = await client.updateGuestProfile(create(UpdateGuestProfileRequestSchema, payload));
    return normalizeGuestProfile(result);
  });
}
