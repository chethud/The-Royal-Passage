export type AdminModule = "experiences" | "homestays";

export const ADMIN_EXPERIENCE_NAV_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/experiences", label: "Approve experiences" },
  { to: "/admin/hosts", label: "Host accounts" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/activity", label: "Activity log" },
  { to: "/experiences", label: "Live catalog" },
] as const;

export const ADMIN_HOMESTAY_NAV_ITEMS = [
  { to: "/admin/homestay", label: "Overview" },
  { to: "/admin/homestays", label: "Approve homestays" },
  { to: "/admin/homestay-owners", label: "Homestay owners" },
  { to: "/homestays", label: "Live catalog" },
] as const;

/** @deprecated Use adminNavItemsForModule(resolveAdminModule(pathname)) instead. */
export const ADMIN_NAV_ITEMS = ADMIN_EXPERIENCE_NAV_ITEMS;

export function resolveAdminModule(pathname: string): AdminModule {
  if (
    pathname === "/admin/homestay" ||
    pathname.startsWith("/admin/homestay/") ||
    pathname.startsWith("/admin/homestays") ||
    pathname.startsWith("/admin/homestay-owners")
  ) {
    return "homestays";
  }
  return "experiences";
}

export function adminModuleHome(module: AdminModule): string {
  return module === "homestays" ? "/admin/homestay" : "/admin";
}

export function adminModuleLabel(module: AdminModule): string {
  return module === "homestays" ? "Homestays admin" : "Experiences admin";
}

export function adminNavItemsForModule(module: AdminModule) {
  const items = module === "homestays" ? ADMIN_HOMESTAY_NAV_ITEMS : ADMIN_EXPERIENCE_NAV_ITEMS;
  return items.map((item) => ({ label: item.label, to: item.to }));
}

export function isAdminNavItemActive(pathname: string, to: string): boolean {
  if (to === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  if (to === "/admin/homestay") {
    return pathname === "/admin/homestay" || pathname === "/admin/homestay/";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
