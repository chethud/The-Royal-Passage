export const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/experiences", label: "Approve experiences" },
  { to: "/admin/homestays", label: "Approve homestays" },
  { to: "/admin/hosts", label: "Host accounts" },
  { to: "/admin/homestay-owners", label: "Homestay owners" },
  { to: "/experiences", label: "Live catalog" },
  { to: "/homestays", label: "Homestays" },
] as const;
