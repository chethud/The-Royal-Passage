/** Host dashboard sections — shown in the site header, not duplicated in the dashboard layout. */
export const HOST_NAV_ITEMS = [
  { to: "/host/dashboard", label: "Overview" },
  { to: "/host/bookings", label: "Bookings" },
  { to: "/host/experiences", label: "My Experiences" },
  { to: "/host/experiences/new", label: "Add experience" },
  { to: "/host/revenue", label: "Revenue" },
  { to: "/host/reviews", label: "Reviews" },
  { to: "/host/profile", label: "Profile" },
] as const;
