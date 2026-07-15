/** Whether a homestay owner header nav item should appear active for the current path. */
export function isHomestayOwnerNavItemActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;

  if (to === "/homestay/properties") {
    const segment = pathname.match(/^\/homestay\/properties\/([^/]+)$/)?.[1];
    return segment !== undefined && segment !== "new";
  }

  return pathname.startsWith(`${to}/`);
}
