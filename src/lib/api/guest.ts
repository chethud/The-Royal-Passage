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
  avatarUrl: string | null;
  dateOfBirth: string | null;
  vipMembershipStatus: string;
  registrationNumber: string | null;
};

export type UpdateGuestProfilePayload = {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
};

function normalizeGuestProfile(raw: {
  id?: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  role?: string;
  createdAt?: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  vipMembershipStatus?: string | null;
  registrationNumber?: string | null;
}): GuestProfile {
  return {
    id: String(raw.id ?? ""),
    email: raw.email != null ? String(raw.email) : null,
    fullName: raw.fullName != null ? String(raw.fullName) : null,
    phone: raw.phone != null ? String(raw.phone) : null,
    role: String(raw.role ?? "guest"),
    createdAt: String(raw.createdAt ?? ""),
    avatarUrl: raw.avatarUrl != null && String(raw.avatarUrl).trim() ? String(raw.avatarUrl) : null,
    dateOfBirth:
      raw.dateOfBirth != null && String(raw.dateOfBirth).trim() ? String(raw.dateOfBirth) : null,
    vipMembershipStatus: String(raw.vipMembershipStatus ?? "none"),
    registrationNumber:
      raw.registrationNumber != null && String(raw.registrationNumber).trim()
        ? String(raw.registrationNumber).trim()
        : null,
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
  // Connect RPC on older deployed backends only accepts fullName and phone.
  const rpcPayload: Pick<UpdateGuestProfilePayload, "fullName" | "phone"> = {};
  if (payload.fullName !== undefined) rpcPayload.fullName = payload.fullName;
  if (payload.phone !== undefined) rpcPayload.phone = payload.phone;
  return rpcCall(async () => {
    const result = await client.updateGuestProfile(create(UpdateGuestProfileRequestSchema, rpcPayload));
    return normalizeGuestProfile(result);
  });
}
