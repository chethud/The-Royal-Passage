import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  CreateVipCustomPackageRequestSchema,
  SubmitVipMembershipApplicationRequestSchema,
  VipMembershipActionRequestSchema,
} from "@/gen/royalpassage/v1/types_pb";
import type { GuestProfile } from "@/lib/api/guest";

export type VipMembershipStatus = "none" | "skipped" | "pending" | "approved" | "rejected";

export type VipMembershipApplicationSummary = {
  id: string;
  guestUserId: string;
  fullName: string;
  email: string;
  phone: string | null;
  idDocumentType: string;
  status: string;
  createdAt: string;
};

export type VipCustomPackageRequestSummary = {
  id: string;
  guestUserId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  travelStart: string;
  travelEnd: string;
  guestCount: number;
  preferences: string | null;
  status: string;
  createdAt: string;
};

export type SubmitVipMembershipPayload = {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  idDocumentType: "aadhaar" | "visitor_id" | "business_id";
  idDocumentNumber: string;
};

export type CreateVipCustomPackagePayload = {
  travelStart: string;
  travelEnd: string;
  guestCount: number;
  preferences?: string;
  guestPhone?: string;
};

export function skipVipMembershipInterest(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() => client.skipVipMembershipInterest({})) as Promise<GuestProfile>;
}

export function submitVipMembershipApplication(
  accessToken: string,
  payload: SubmitVipMembershipPayload,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.submitVipMembershipApplication(
      create(SubmitVipMembershipApplicationRequestSchema, payload),
    ),
  ) as Promise<GuestProfile>;
}

export function submitVipCustomPackageRequest(
  accessToken: string,
  payload: CreateVipCustomPackagePayload,
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.submitVipCustomPackageRequest(create(CreateVipCustomPackageRequestSchema, payload)),
  ) as Promise<VipCustomPackageRequestSummary>;
}

export function fetchVipMembershipApplications(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listVipMembershipApplications({});
    return response.applications as VipMembershipApplicationSummary[];
  });
}

export function approveVipMembership(accessToken: string, applicationId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.approveVipMembership(
      create(VipMembershipActionRequestSchema, { applicationId }),
    ),
  ) as Promise<VipMembershipApplicationSummary>;
}

export function rejectVipMembership(accessToken: string, applicationId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.rejectVipMembership(create(VipMembershipActionRequestSchema, { applicationId })),
  ) as Promise<VipMembershipApplicationSummary>;
}

export function fetchVipCustomPackageRequests(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listVipCustomPackageRequests({});
    return response.requests as VipCustomPackageRequestSummary[];
  });
}

export function isVipMembershipStatus(value: string | null | undefined): value is VipMembershipStatus {
  return (
    value === "none" ||
    value === "skipped" ||
    value === "pending" ||
    value === "approved" ||
    value === "rejected"
  );
}

export function isApprovedVipMember(status: string | null | undefined): boolean {
  return status === "approved";
}

export function shouldPromptVipMembership(status: string | null | undefined): boolean {
  return !status || status === "none";
}
