import { createServerFn } from "@tanstack/react-start";
import { vips as staticVips } from "@/data/vips";
import type { VipPackage } from "@/data/vips";
import { isMysuruVip } from "@/lib/vip-filters";

function fallbackCatalog() {
  const packages = staticVips.filter(isMysuruVip);
  return {
    mode: "static" as const,
    vips: packages,
    packageTypes: [...new Set(packages.map((pkg) => pkg.packageType))],
    cities: [...new Set(packages.map((pkg) => pkg.city))],
  };
}

export const getVipsForUi = createServerFn({ method: "GET" }).handler(async () => {
  return fallbackCatalog();
});

export const getVipForDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const pkg = staticVips.find((row) => row.slug === data.slug);
    if (!pkg) return null;
    return { vip: pkg, source: "static" as const };
  });

export type VipCatalog = {
  mode: "static" | "live";
  vips: VipPackage[];
  packageTypes: string[];
  cities: string[];
};
