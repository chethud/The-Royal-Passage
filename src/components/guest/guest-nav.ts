export const GUEST_NAV_ITEMS = [
  { to: "/dashboard", label: "Upcoming", exact: true },
  { to: "/dashboard/past", label: "Past" },
  { to: "/dashboard/cancelled", label: "Cancelled" },
  { to: "/dashboard/wishlist", label: "Wishlist" },
  { to: "/dashboard/profile", label: "Profile" },
] as const;
