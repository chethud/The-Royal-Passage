export type PublicSiteModule = "experiences" | "homestays" | "vip";

export const EXPERIENCE_PUBLIC_NAV_ITEMS = [
  { label: "Experiences", to: "/experiences" },
] as const;

export const HOMESTAY_PUBLIC_NAV_ITEMS = [
  { label: "Browse Stays", to: "/homestays/browse" },
] as const;

export const VIP_PUBLIC_NAV_ITEMS = [
  { label: "Browse", to: "/vips/browse" },
] as const;

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
    return (
      pathname === "/" ||
      pathname === "/experiences" ||
      pathname.startsWith("/experiences/")
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
