export type AdminModule = "experiences" | "homestays" | "vip";

export const ADMIN_EXPERIENCE_NAV_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/experiences", label: "Approve experiences" },
  { to: "/admin/banners", label: "Banners" },
  { to: "/experiences", label: "Live catalog" },
] as const;

export const ADMIN_HOMESTAY_NAV_ITEMS = [
  { to: "/admin/homestay", label: "Overview" },
  { to: "/admin/homestays", label: "Approve homestays" },
  { to: "/admin/homestay-owners", label: "Homestay owners" },
  { to: "/admin/homestay-featured", label: "Featured homestays" },
  { to: "/homestays", label: "Live catalog" },
] as const;

export const ADMIN_VIP_NAV_ITEMS = [
  { to: "/admin/vip", label: "Overview" },
  { to: "/admin/vip-packages", label: "Approve packages" },
  { to: "/admin/vip-owners", label: "VIP owners" },
  { to: "/vips", label: "Live catalog" },
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
    pathname.startsWith("/admin/homestay-owners") ||
    pathname.startsWith("/admin/homestay-featured")
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

/** Module switcher (Experiences / Homestays / VIP) only on marketplace overview pages. */
export function isAdminOverviewPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/homestay" ||
    pathname === "/admin/homestay/" ||
    pathname === "/admin/vip" ||
    pathname === "/admin/vip/"
  );
}

/** Pending-approval queue for each admin marketplace module. */
export function adminModuleQueuePath(module: AdminModule): string {
  if (module === "homestays") return "/admin/homestays";
  if (module === "vip") return "/admin/vip-packages";
  return "/admin/experiences";
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
  if (to === "/admin/homestay-featured") {
    return pathname === "/admin/homestay-featured" || pathname.startsWith("/admin/homestay-featured/");
  }
  if (to === "/admin/vip") {
    return pathname === "/admin/vip" || pathname === "/admin/vip/";
  }
  if (to === "/admin/profile") {
    return pathname === "/admin/profile" || pathname.startsWith("/admin/profile/");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
