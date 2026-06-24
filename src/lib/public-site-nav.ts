export type PublicSiteModule = "experiences" | "homestays" | "vip";

export const EXPERIENCE_PUBLIC_NAV_ITEMS = [
  { label: "Experiences", to: "/experiences" },
] as const;

export const HOMESTAY_PUBLIC_NAV_ITEMS = [
  { label: "Homestays", to: "/homestays/browse" },
] as const;

export const VIP_PUBLIC_NAV_ITEMS = [
  { label: "Browse packages", to: "/vips/browse" },
] as const;

export type PublicNavLink = { label: string; to: string };

/** Cross-module links shown beside the primary section nav (unsigned visitors). */
export const EXPERIENCE_CROSS_NAV_ITEMS: PublicNavLink[] = [
  { label: "Homestays", to: "/homestays" },
];

export const HOMESTAY_CROSS_NAV_ITEMS: PublicNavLink[] = [
  { label: "Experiences", to: "/" },
  { label: "VIP", to: "/vips" },
];

export const VIP_CROSS_NAV_ITEMS: PublicNavLink[] = [
  { label: "Experiences", to: "/" },
  { label: "Homestays", to: "/homestays" },
];

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

export function publicNavItemsForSection(pathname: string) {
  const module = resolvePublicSiteModule(pathname);
  const items =
    module === "vip"
      ? VIP_PUBLIC_NAV_ITEMS
      : module === "homestays"
        ? HOMESTAY_PUBLIC_NAV_ITEMS
        : EXPERIENCE_PUBLIC_NAV_ITEMS;
  return items.map((item) => ({ label: item.label, to: item.to }));
}

export function publicCrossNavItemsForSection(pathname: string): PublicNavLink[] {
  if (isVipPublicSection(pathname)) return VIP_CROSS_NAV_ITEMS;
  if (isHomestayPublicSection(pathname)) return HOMESTAY_CROSS_NAV_ITEMS;
  return EXPERIENCE_CROSS_NAV_ITEMS;
}

export function isPublicNavItemActive(pathname: string, to: string): boolean {
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
  if (to === "/homestays") {
    return pathname === "/homestays" || pathname === "/homestays/";
  }
  if (to === "/experiences") {
    return pathname === "/experiences" || pathname.startsWith("/experiences/");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
