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
  editor: "Sign in to edit homepage photos, hero headings, journal stories, and the heritage video section.",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  guest: "/",
  host: "/host/dashboard",
  homestay_owner: "/homestay/dashboard",
  vip_owner: "/vip/dashboard",
  admin: "/admin",
  editor: "/admin/homepage-edit",
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

/** Workspace priority for multi-role accounts (admin wins; editor is not above hosts). */
const ROLE_PRIORITY: UserRole[] = [
  "admin",
  "host",
  "homestay_owner",
  "vip_owner",
  "editor",
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

/**
 * Which staff workspace the header/nav should mirror based on the current URL.
 * Multi-role accounts switch chrome when they open Homestay / VIP / Editor tools.
 */
export function activeWorkspaceRole(
  pathname: string,
  roles: readonly UserRole[] | null | undefined,
  primaryRole?: UserRole | null,
): UserRole | null {
  const resolved = resolveUserRoles(roles, primaryRole ?? null);
  const primary = pickPrimaryRole(roles, primaryRole);

  if (
    (pathname === "/homestay" || pathname.startsWith("/homestay/")) &&
    resolved.includes("homestay_owner")
  ) {
    return "homestay_owner";
  }
  if ((pathname === "/host" || pathname.startsWith("/host/")) && resolved.includes("host")) {
    return "host";
  }
  if ((pathname === "/vip" || pathname.startsWith("/vip/")) && resolved.includes("vip_owner")) {
    return "vip_owner";
  }
  if (
    (pathname.startsWith("/admin/homepage-edit") ||
      pathname.startsWith("/admin/homepage-photos") ||
      pathname.startsWith("/admin/profile/homepage-photos") ||
      pathname.startsWith("/admin/homestay-featured")) &&
    hasAnyRole(resolved, ["editor", "admin"], primary)
  ) {
    return hasRole(resolved, "admin", primary) ? "admin" : "editor";
  }
  if (pathname.startsWith("/admin") && resolved.includes("admin")) {
    return "admin";
  }

  return primary;
}

export type RoleWorkspaceLink = {
  role: UserRole;
  label: string;
  description: string;
  to: string;
};

const WORKSPACE_META: Record<
  Exclude<UserRole, "guest">,
  { label: string; description: string }
> = {
  admin: { label: "Admin dashboard", description: "Manage the full platform" },
  host: { label: "Host dashboard", description: "Experiences, bookings & revenue" },
  homestay_owner: { label: "Homestay dashboard", description: "Properties & stay bookings" },
  vip_owner: { label: "VIP dashboard", description: "VIP packages & members" },
  editor: { label: "Editor tools", description: "Homepage photos, headings & journal" },
};

/** Every staff workspace the account may open (in priority order). */
export function workspaceLinksForRoles(
  roles: readonly UserRole[] | null | undefined,
  primaryRole?: UserRole | null,
): RoleWorkspaceLink[] {
  const resolved = resolveUserRoles(roles, primaryRole ?? null);
  const links: RoleWorkspaceLink[] = [];
  for (const role of ROLE_PRIORITY) {
    if (role === "guest") continue;
    if (!resolved.includes(role)) continue;
    const meta = WORKSPACE_META[role];
    links.push({
      role,
      label: meta.label,
      description: meta.description,
      to: ROLE_DASHBOARD_PATH[role],
    });
  }
  return links;
}

export function isEditorRole(role: UserRole | null | undefined): boolean {
  return role === "editor";
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

/** True when the account includes editor (multi-role safe). */
export function hasEditorAccess(
  roles?: readonly UserRole[] | null,
  primaryRole?: UserRole | null,
): boolean {
  return hasAnyRole(roles, ["editor", "admin"], primaryRole);
}

/** True when the account includes admin (multi-role safe). */
export function hasAdminAccess(
  roles?: readonly UserRole[] | null,
  primaryRole?: UserRole | null,
): boolean {
  return hasRole(roles, "admin", primaryRole);
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

/** Hero photos, headings, and top experiences — editors and admins. */
export function canEditHomepageAdminSections(
  role: UserRole | null | undefined,
  roles?: readonly UserRole[] | null,
): boolean {
  return hasAnyRole(roles, ["editor", "admin"], role);
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
