export type AdminModule = "experiences" | "homestays" | "vip";

export const ADMIN_EXPERIENCE_NAV_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/experiences", label: "Approve experiences" },
  { to: "/experiences", label: "Live catalog" },
] as const;

export const ADMIN_HOMESTAY_NAV_ITEMS = [
  { to: "/admin/homestay", label: "Overview" },
  { to: "/admin/homestays", label: "Approve homestays" },
  { to: "/admin/homestay-owners", label: "Homestay owners" },
  { to: "/admin/homestay-featured", label: "Featured homestays" },
  { to: "/homestays/browse", label: "Live catalog" },
] as const;

export const ADMIN_VIP_NAV_ITEMS = [
  { to: "/admin/vip", label: "Overview" },
  { to: "/admin/vip-packages", label: "Approve packages" },
  { to: "/admin/vip-owners", label: "VIP owners" },
  { to: "/vips", label: "Live catalog" },
] as const;

/** @deprecated Use adminNavItemsForModule(resolveAdminModule(pathname)) instead. */
export const ADMIN_NAV_ITEMS = ADMIN_EXPERIENCE_NAV_ITEMS;

function normalizeAdminPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function resolveAdminModule(pathname: string): AdminModule {
  const path = normalizeAdminPath(pathname);

  if (path === "/admin/profile" || path.startsWith("/admin/profile/")) {
    return "experiences";
  }
  if (
    path === "/vips" ||
    path.startsWith("/vips/") ||
    path === "/admin/vip" ||
    path.startsWith("/admin/vip/") ||
    path.startsWith("/admin/vip-packages") ||
    path.startsWith("/admin/vip-owners")
  ) {
    return "vip";
  }
  if (
    path === "/homestays" ||
    path.startsWith("/homestays/") ||
    path === "/admin/homestay" ||
    path.startsWith("/admin/homestay/") ||
    path.startsWith("/admin/homestays") ||
    path.startsWith("/admin/homestay-owners") ||
    path.startsWith("/admin/homestay-featured")
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
  const path = normalizeAdminPath(pathname);
  return path === "/admin" || path === "/admin/homestay" || path === "/admin/vip";
}

/** Pending-approval queue for each admin marketplace module. */
export function adminModuleQueuePath(module: AdminModule): string {
  if (module === "homestays") return "/admin/homestays";
  if (module === "vip") return "/admin/vip-packages";
  return "/admin/experiences";
}

/** Host listing-approval requests list opened from the module notify strip. */
export function adminModuleHostRequestsPath(module: AdminModule): string {
  if (module === "homestays") return "/admin/homestay/requests";
  if (module === "vip") return "/admin/vip/requests";
  return "/admin/experiences/requests";
}

/** Guest bookings still pending host/owner accept. */
export function adminModulePendingBookingsPath(module: AdminModule): string {
  if (module === "homestays") return "/admin/homestay/pending-bookings";
  if (module === "vip") return "/admin/vip/pending-bookings";
  return "/admin/experiences/pending-bookings";
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
  const path = normalizeAdminPath(pathname);
  const target = normalizeAdminPath(to);

  if (target === "/admin") {
    return path === "/admin";
  }
  if (target === "/admin/homestay") {
    return path === "/admin/homestay";
  }
  if (target === "/admin/homestay-featured") {
    return path === "/admin/homestay-featured" || path.startsWith("/admin/homestay-featured/");
  }
  if (target === "/homestays/browse") {
    return (
      path === "/homestays/browse" ||
      path.startsWith("/homestays/browse/") ||
      (path.startsWith("/homestays/") && path !== "/homestays")
    );
  }
  if (target === "/admin/vip") {
    return path === "/admin/vip";
  }
  if (target === "/admin/profile") {
    return path === "/admin/profile" || path.startsWith("/admin/profile/");
  }
  return path === target || path.startsWith(`${target}/`);
}
