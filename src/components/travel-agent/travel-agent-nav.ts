/** Travel agent dashboard sections — shown in the site header. */
export const TRAVEL_AGENT_NAV_ITEMS = [
  { to: "/travel-agent/dashboard", label: "Overview" },
  { to: "/travel-agent/catalog", label: "Book for client" },
  { to: "/travel-agent/bookings", label: "My bookings" },
] as const;
