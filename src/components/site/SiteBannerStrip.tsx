import { useEffect, useState } from "react";
import { fetchActiveSiteBanners, type SiteBanner } from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";

export function SiteBannerStrip() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);

  useEffect(() => {
    if (!isApiConfigured()) return;
    let cancelled = false;
    void fetchActiveSiteBanners("home_top")
      .then((payload) => {
        if (!cancelled) setBanners(payload.banners ?? []);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (banners.length === 0) return null;
  const banner = banners[0];

  const inner = (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[0.72rem] tracking-[0.04em] text-[#F7F1E8]">
      <span className="font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]">{banner.title}</span>
      {banner.body ? <span className="text-[#F7F1E8]/85">{banner.body}</span> : null}
    </div>
  );

  if (banner.href?.startsWith("/")) {
    return (
      <div className="border-b border-[rgb(200_162_90/0.22)] bg-[#3a0000]/95">
        <a href={banner.href} className="block transition-colors hover:bg-[#4a0000]">
          {inner}
        </a>
      </div>
    );
  }

  return <div className="border-b border-[rgb(200_162_90/0.22)] bg-[#3a0000]/95">{inner}</div>;
}
