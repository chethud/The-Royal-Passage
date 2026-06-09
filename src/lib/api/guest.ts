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

export function fetchGuestProfile(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.getGuestProfile({})) as Promise<GuestProfile>;
}

export function updateGuestProfile(accessToken: string, payload: UpdateGuestProfilePayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.updateGuestProfile(create(UpdateGuestProfileRequestSchema, payload)),
  ) as Promise<GuestProfile>;
}
