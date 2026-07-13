import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchActiveSiteBanners, type SiteBanner } from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";

type SiteBannerStripProps = {
  className?: string;
};

export function SiteBannerStrip({ className = "" }: SiteBannerStripProps) {
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
  const hasImage = Boolean(banner.imageUrl);

  const content = (
    <span
      className={`inline-flex max-w-full items-center gap-3 text-left ${
        hasImage ? "p-1.5 pr-3 sm:pr-4" : "px-4 py-2.5 sm:px-5"
      }`}
    >
      {banner.imageUrl ? (
        <img
          src={banner.imageUrl}
          alt=""
          className="h-14 w-20 shrink-0 rounded-[2px] object-cover sm:h-16 sm:w-24"
        />
      ) : null}
      <span className="min-w-0 space-y-0.5">
        <span className="block font-display text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ember sm:text-[0.7rem]">
          {banner.title}
        </span>
        {banner.body ? (
          <span className="block text-[0.78rem] leading-snug text-[#F7F1E8]/90 sm:text-[0.82rem]">
            {banner.body}
          </span>
        ) : null}
      </span>
      {banner.href ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ember">
          View
          <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
        </span>
      ) : null}
    </span>
  );

  const shellClass = `mx-auto mt-2 w-fit max-w-[min(92vw,32rem)] overflow-hidden rounded-sm border border-[oklch(0.76_0.1_78_/_0.32)] bg-[oklch(0.14_0.06_22_/_0.78)] shadow-[0_12px_32px_-16px_oklch(0.05_0.04_18_/_0.7)] backdrop-blur-md transition-colors hover:border-[oklch(0.76_0.1_78_/_0.48)] hover:bg-[oklch(0.17_0.07_22_/_0.88)] ${className}`;

  if (banner.href?.startsWith("/")) {
    return (
      <div className="pointer-events-none flex w-full justify-center px-3 sm:px-4">
        <Link to={banner.href} className={`pointer-events-auto block ${shellClass}`}>
          {content}
        </Link>
      </div>
    );
  }

  if (banner.href) {
    return (
      <div className="pointer-events-none flex w-full justify-center px-3 sm:px-4">
        <a
          href={banner.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`pointer-events-auto block ${shellClass}`}
        >
          {content}
        </a>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-3 sm:px-4">
      <div className={shellClass}>{content}</div>
    </div>
  );
}
