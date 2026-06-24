import { createServerFn } from "@tanstack/react-start";
import { vips as staticVips } from "@/data/vips";
import type { VipStay } from "@/data/vips";
import { isMysuruVip } from "@/lib/vip-filters";

function fallbackCatalog() {
  const listings = staticVips.filter(isMysuruVip);
  return {
    mode: "static" as const,
    vips: listings,
    propertyTypes: [...new Set(listings.map((stay) => stay.propertyType))],
    cities: [...new Set(listings.map((stay) => stay.city))],
  };
}

export const getVipsForUi = createServerFn({ method: "GET" }).handler(async () => {
  return fallbackCatalog();
});

export const getVipForDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const stay = staticVips.find((row) => row.slug === data.slug);
    if (!stay) return null;
    return { vip: stay, source: "static" as const };
  });

export type VipCatalog = {
  mode: "static" | "live";
  vips: VipStay[];
  propertyTypes: string[];
  cities: string[];
};
