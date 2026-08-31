/** Whether a travel agent header nav item should appear active for the current path. */
export function isTravelAgentNavItemActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;
  return pathname.startsWith(`${to}/`);
}
