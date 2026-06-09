/** Guest booking sections — shown in the site header, not duplicated in the dashboard layout. */
export const GUEST_NAV_ITEMS = [
  { to: "/dashboard", label: "Upcoming", exact: true },
  { to: "/dashboard/past", label: "Past" },
  { to: "/dashboard/cancelled", label: "Cancelled" },
  { to: "/dashboard/wishlist", label: "Wishlist" },
] as const;
