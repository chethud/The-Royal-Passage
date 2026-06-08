import type { UserRole } from "@/lib/roles";
import { apiFetch } from "@/lib/api/client";

export type ManagedUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  hostId: string | null;
  createdAt: string;
};

export function fetchManagedUsers(accessToken: string) {
  return apiFetch<ManagedUser[]>("/api/v1/admin/users", { accessToken });
}

export type CreateHostPayload = {
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
};

export function createHost(accessToken: string, payload: CreateHostPayload) {
  return apiFetch<{ id: string; email: string; displayName: string; hostId: string }>(
    "/api/v1/admin/hosts",
    {
      method: "POST",
      accessToken,
      body: JSON.stringify(payload),
    },
  );
}
