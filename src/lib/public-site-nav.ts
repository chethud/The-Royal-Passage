export type PublicSiteModule = "experiences" | "homestays";

export const EXPERIENCE_PUBLIC_NAV_ITEMS = [
  { label: "Experiences", to: "/experiences" },
  { label: "About Us", to: "/hosts" },
  { label: "Journal", to: "/journal" },
] as const;

export const HOMESTAY_PUBLIC_NAV_ITEMS = [
  { label: "Browse Stays", to: "/homestays/browse" },
  { label: "About Us", to: "/hosts" },
  { label: "Journal", to: "/journal" },
] as const;

export function isHomestayPublicSection(pathname: string): boolean {
  return pathname === "/homestays" || pathname.startsWith("/homestays/");
}

export function resolvePublicSiteModule(pathname: string): PublicSiteModule {
  return isHomestayPublicSection(pathname) ? "homestays" : "experiences";
}

export function publicNavItemsForSection(pathname: string) {
  const items =
    resolvePublicSiteModule(pathname) === "homestays"
      ? HOMESTAY_PUBLIC_NAV_ITEMS
      : EXPERIENCE_PUBLIC_NAV_ITEMS;
  return items.map((item) => ({ label: item.label, to: item.to }));
}

export function isPublicNavItemActive(pathname: string, to: string): boolean {
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
