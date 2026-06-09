/** Whether a host sidebar/header nav item should appear active for the current path. */
export function isHostNavItemActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;

  // "/host/experiences/new" must not also activate "My Experiences".
  if (to === "/host/experiences/new") return false;

  if (to === "/host/experiences") {
    const segment = pathname.match(/^\/host\/experiences\/([^/]+)$/)?.[1];
    return segment !== undefined && segment !== "new";
  }

  return pathname.startsWith(`${to}/`);
}
