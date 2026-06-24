export function isVipOwnerNavItemActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;

  if (to === "/vip/listings/new") return false;

  if (to === "/vip/listings") {
    const segment = pathname.match(/^\/vip\/listings\/([^/]+)$/)?.[1];
    return segment !== undefined && segment !== "new";
  }

  if (to === "/vip/dashboard") {
    return pathname === "/vip/dashboard" || pathname === "/vip/dashboard/";
  }

  return pathname.startsWith(`${to}/`);
}
