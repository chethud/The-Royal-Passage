/** Homestay owner dashboard sections — shown in the site header. */
export const HOMESTAY_OWNER_NAV_ITEMS = [
  { to: "/homestay/dashboard", label: "Overview" },
  { to: "/homestay/bookings", label: "Bookings" },
  { to: "/homestay/properties", label: "My properties" },
  { to: "/homestay/offers", label: "Offers" },
  { to: "/homestay/revenue", label: "Revenue" },
] as const;
