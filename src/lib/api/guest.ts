import { apiFetch } from "@/lib/api/client";

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
  return apiFetch<GuestProfile>("/api/v1/guest/profile", { accessToken });
}

export function updateGuestProfile(accessToken: string, payload: UpdateGuestProfilePayload) {
  return apiFetch<GuestProfile>("/api/v1/guest/profile", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}
