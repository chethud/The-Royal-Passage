/** Platform roles — experience providers are **hosts**; property providers are **homestay owners**; VIP providers are **vip owners**. */
export const USER_ROLES = ["guest", "host", "homestay_owner", "vip_owner", "admin", "editor"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Guest",
  host: "Host",
  homestay_owner: "Homestay owner",
  vip_owner: "VIP owner",
  admin: "Admin",
  editor: "Editor",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  guest: "Sign up or sign in to book experiences.",
  host: "Sign in with login credentials provided by Royal Passage.",
  homestay_owner: "Sign in with homestay owner credentials provided by Royal Passage.",
  vip_owner: "Sign in with VIP owner credentials provided by Royal Passage.",
  admin: "Sign in with your admin credentials — manage bookings, experiences, and homepage hero, showcase, and video sections.",
  editor: "Sign in to edit journal stories and the heritage video section on the homepage.",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  guest: "/",
  host: "/host/dashboard",
  homestay_owner: "/homestay/dashboard",
  vip_owner: "/vip/dashboard",
  admin: "/admin",
  editor: "/",
};

export const ROLE_PROFILE_PATH: Record<UserRole, string> = {
  guest: "/account/profile",
  host: "/account/profile",
  homestay_owner: "/account/profile",
  vip_owner: "/account/profile",
  admin: "/admin/profile",
  editor: "/account/profile",
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

export function profilePathForRole(role: UserRole | null | undefined): string {
  if (!role) return "/sign-in";
  return ROLE_PROFILE_PATH[role];
}

/** Host, homestay owner, VIP owner, admin, or editor — not allowed to book as a guest. */
export function isStaffRole(role: UserRole | null | undefined): boolean {
  return (
    role === "host" ||
    role === "homestay_owner" ||
    role === "vip_owner" ||
    role === "admin" ||
    role === "editor"
  );
}

export function resolveUserRoles(
  roles: readonly UserRole[] | null | undefined,
  primaryRole: UserRole | null | undefined,
): UserRole[] {
  const resolved = [...(roles ?? [])].filter(isUserRole);
  if (resolved.length > 0) return [...new Set(resolved)];
  if (primaryRole && isUserRole(primaryRole)) return [primaryRole];
  return [];
}

const ROLE_PRIORITY: UserRole[] = [
  "admin",
  "editor",
  "host",
  "homestay_owner",
  "vip_owner",
  "guest",
];

/** Highest-privilege role from a multi-role profile (admin wins over guest, etc.). */
export function pickPrimaryRole(
  roles: readonly UserRole[] | null | undefined,
  fallbackRole?: UserRole | null,
): UserRole | null {
  const resolved = resolveUserRoles(roles, fallbackRole ?? null);
  for (const role of ROLE_PRIORITY) {
    if (resolved.includes(role)) return role;
  }
  return fallbackRole && isUserRole(fallbackRole) ? fallbackRole : null;
}

export function hasRole(
  roles: readonly UserRole[] | null | undefined,
  role: UserRole,
  primaryRole?: UserRole | null,
): boolean {
  return resolveUserRoles(roles, primaryRole ?? null).includes(role);
}

export function hasAnyRole(
  roles: readonly UserRole[] | null | undefined,
  candidates: readonly UserRole[],
  primaryRole?: UserRole | null,
): boolean {
  const resolved = resolveUserRoles(roles, primaryRole ?? null);
  return candidates.some((role) => resolved.includes(role));
}

export function dashboardPathForRoles(
  roles: readonly UserRole[] | null | undefined,
  primaryRole?: UserRole | null,
): string {
  return dashboardPathForRole(pickPrimaryRole(roles, primaryRole));
}

export function isEditorRole(role: UserRole | null | undefined): boolean {
  return role === "editor";
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

/** Journal section — editors and admins. */
export function canEditHomepageJournal(
  role: UserRole | null | undefined,
  roles?: readonly UserRole[] | null,
): boolean {
  return hasAnyRole(roles, ["editor", "admin"], role);
}

/** Heritage video section (title, description, YouTube link) — editors and admins. */
export function canEditHomepageJourneys(
  role: UserRole | null | undefined,
  roles?: readonly UserRole[] | null,
): boolean {
  return hasAnyRole(roles, ["editor", "admin"], role);
}

/** Hero and top experiences — admins only. */
export function canEditHomepageAdminSections(
  role: UserRole | null | undefined,
  roles?: readonly UserRole[] | null,
): boolean {
  return hasRole(roles, "admin", role);
}

/** Signed-in user who may book experiences (guest, or profile still loading). */
export function isGuestAccount(
  role: UserRole | null | undefined,
  roles?: readonly UserRole[] | null,
): boolean {
  if (hasAnyRole(roles, ["host", "homestay_owner", "vip_owner", "admin", "editor"], role)) {
    return false;
  }
  return !isStaffRole(role);
}
