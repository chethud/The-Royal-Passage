export type AdminModule = "experiences" | "homestays" | "vip";

export const ADMIN_EXPERIENCE_NAV_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/experiences", label: "Approve experiences" },
  { to: "/admin/hosts", label: "Host accounts" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/activity", label: "Activity log" },
  { to: "/admin/homepage-edit", label: "Edit homepage" },
  { to: "/experiences", label: "Live catalog" },
  { to: "/admin/profile", label: "Account" },
] as const;

export const ADMIN_HOMESTAY_NAV_ITEMS = [
  { to: "/admin/homestay", label: "Overview" },
  { to: "/admin/homestays", label: "Approve homestays" },
  { to: "/admin/homestay-owners", label: "Homestay owners" },
  { to: "/admin/homepage-edit", label: "Edit homepage" },
  { to: "/homestays", label: "Live catalog" },
  { to: "/admin/profile", label: "Account" },
] as const;

export const ADMIN_VIP_NAV_ITEMS = [
  { to: "/admin/vip", label: "Overview" },
  { to: "/admin/vip-packages", label: "Approve packages" },
  { to: "/admin/vip-owners", label: "VIP owners" },
  { to: "/admin/homepage-edit", label: "Edit homepage" },
  { to: "/vips", label: "Live catalog" },
  { to: "/admin/profile", label: "Account" },
] as const;

/** @deprecated Use adminNavItemsForModule(resolveAdminModule(pathname)) instead. */
export const ADMIN_NAV_ITEMS = ADMIN_EXPERIENCE_NAV_ITEMS;

export function resolveAdminModule(pathname: string): AdminModule {
  if (pathname === "/admin/profile" || pathname.startsWith("/admin/profile/")) {
    return "experiences";
  }
  if (
    pathname === "/admin/vip" ||
    pathname.startsWith("/admin/vip/") ||
    pathname.startsWith("/admin/vip-packages") ||
    pathname.startsWith("/admin/vip-owners")
  ) {
    return "vip";
  }
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
  if (module === "homestays") return "/admin/homestay";
  if (module === "vip") return "/admin/vip";
  return "/admin";
}

export function adminModuleLabel(module: AdminModule): string {
  if (module === "homestays") return "Homestays admin";
  if (module === "vip") return "VIP admin";
  return "Experiences admin";
}

export function adminNavItemsForModule(module: AdminModule) {
  const items =
    module === "homestays"
      ? ADMIN_HOMESTAY_NAV_ITEMS
      : module === "vip"
        ? ADMIN_VIP_NAV_ITEMS
        : ADMIN_EXPERIENCE_NAV_ITEMS;
  return items.map((item) => ({ label: item.label, to: item.to }));
}

export function isAdminNavItemActive(pathname: string, to: string): boolean {
  if (to === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  if (to === "/admin/homestay") {
    return pathname === "/admin/homestay" || pathname === "/admin/homestay/";
  }
  if (to === "/admin/vip") {
    return pathname === "/admin/vip" || pathname === "/admin/vip/";
  }
  if (to === "/admin/profile") {
    return pathname === "/admin/profile" || pathname.startsWith("/admin/profile/");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
