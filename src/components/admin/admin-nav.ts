export const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/experiences", label: "Approve experiences" },
  { to: "/admin/hosts", label: "Host accounts" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/activity", label: "Activity" },
  { to: "/admin/homepage-edit", label: "Edit homepage" },
  { to: "/experiences", label: "Live catalog" },
  { to: "/admin/profile", label: "Profile" },
] as const;
