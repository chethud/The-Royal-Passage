/** Platform roles — experience providers are called **hosts** in this product. */
export const USER_ROLES = ["guest", "host", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Guest",
  host: "Host",
  admin: "Admin",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  guest: "Browse and book curated experiences in Mysuru.",
  host: "Offer experiences — pottery, farm walks, culinary sessions, and more.",
  admin: "Manage the platform, hosts, and published experiences.",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  guest: "/dashboard",
  host: "/host/dashboard",
  admin: "/admin",
};

const INTENDED_ROLE_KEY = "rp_intended_role_v1";

export function isUserRole(value: string | null | undefined): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function readIntendedRole(): UserRole {
  if (typeof window === "undefined") return "guest";
  const raw = window.sessionStorage.getItem(INTENDED_ROLE_KEY);
  return isUserRole(raw) ? raw : "guest";
}

export function writeIntendedRole(role: UserRole) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(INTENDED_ROLE_KEY, role);
}

export function dashboardPathForRole(role: UserRole | null | undefined): string {
  if (!role) return "/sign-in";
  return ROLE_DASHBOARD_PATH[role];
}
