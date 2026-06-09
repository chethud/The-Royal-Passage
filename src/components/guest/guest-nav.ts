/** Guest account sections — reachable from the account menu, not the main site header. */
export const GUEST_NAV_ITEMS = [
  { to: "/dashboard/history", label: "History" },
  { to: "/dashboard/profile", label: "Profile" },
] as const;
