export type PublicSiteModule = "experiences" | "homestays" | "vip";

/** Fixed public navbar: Experiences, Homestays, Mysore Trail. */
export const PUBLIC_GUEST_NAV_ITEMS = [
  { label: "Experiences", to: "/experiences" },
  { label: "Homestays", to: "/homestays" },
  { label: "Mysore Trail", to: "/mysore-trail" },
] as const;

export type PublicNavLink = { label: string; to: string };

export function publicGuestNavItems(): PublicNavLink[] {
  return PUBLIC_GUEST_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
}

export function isHomestayPublicSection(pathname: string): boolean {
  return pathname === "/homestays" || pathname.startsWith("/homestays/");
}

export function isVipPublicSection(pathname: string): boolean {
  return pathname === "/vips" || pathname.startsWith("/vips/");
}

export function isMarketplacePublicSection(pathname: string): boolean {
  return isHomestayPublicSection(pathname) || isVipPublicSection(pathname);
}

export function resolvePublicSiteModule(pathname: string): PublicSiteModule {
  if (isVipPublicSection(pathname)) return "vip";
  if (isHomestayPublicSection(pathname)) return "homestays";
  return "experiences";
}

export function marketplaceHomePath(pathname: string): "/" | "/homestays" | "/vips" {
  if (isVipPublicSection(pathname)) return "/vips";
  if (isHomestayPublicSection(pathname)) return "/homestays";
  return "/";
}

/** @deprecated Use publicGuestNavItems — kept for callers expecting section-based API. */
export function publicNavItemsForSection(_pathname: string) {
  return publicGuestNavItems();
}

export function isPublicNavItemActive(pathname: string, to: string): boolean {
  if (to === "/") {
    return pathname === "/" || pathname === "";
  }
  if (to === "/homestays") {
    return isHomestayPublicSection(pathname);
  }
  if (to === "/experiences") {
    return pathname === "/experiences" || pathname.startsWith("/experiences/");
  }
  if (to === "/mysore-trail") {
    return pathname === "/mysore-trail" || pathname.startsWith("/mysore-trail/");
  }
  if (to === "/vips/browse") {
    return (
      pathname === "/vips/browse" ||
      pathname.startsWith("/vips/browse/") ||
      /^\/vips\/[^/]+(\/|$)/.test(pathname)
    );
  }
  if (to === "/vips") {
    return pathname === "/vips" || pathname === "/vips/";
  }
  if (to === "/homestays/browse") {
    return (
      pathname === "/homestays/browse" ||
      pathname.startsWith("/homestays/browse/") ||
      /^\/homestays\/[^/]+(\/|$)/.test(pathname)
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
