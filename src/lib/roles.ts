/** Platform roles — experience providers are called **hosts** in this product. */
export const USER_ROLES = ["guest", "host", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Guest",
  host: "Host",
  admin: "Admin",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  guest: "Sign up or sign in to book experiences.",
  host: "Sign in with login credentials provided by Royal Passage.",
  admin: "Sign in with your admin credentials.",
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

/** Only guests may self-register on the public sign-in page. */
export function canSelfRegister(role: UserRole): boolean {
  return role === "guest";
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

/** Host or admin — not allowed to book as a guest. */
export function isStaffRole(role: UserRole | null | undefined): boolean {
  return role === "host" || role === "admin";
}

/** Signed-in user who may book experiences (guest, or profile still loading). */
export function isGuestAccount(role: UserRole | null | undefined): boolean {
  return !isStaffRole(role);
}
