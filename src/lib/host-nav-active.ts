/** Whether a host sidebar/header nav item should appear active for the current path. */
export function isHostNavItemActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;

  if (to === "/host/experiences") {
    return /^\/host\/experiences\/[^/]+$/.test(pathname);
  }

  if (to === "/host/experiences/new") {
    return false;
  }

  return pathname.startsWith(`${to}/`);
}
