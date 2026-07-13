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

  const content = (
    <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-3 text-center sm:justify-between sm:px-6 sm:text-left md:px-10">
      <div className="min-w-0 space-y-0.5">
        <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ember sm:text-[0.75rem]">
          {banner.title}
        </p>
        {banner.body ? (
          <p className="text-[0.8rem] leading-snug text-[#F7F1E8]/88 sm:text-[0.85rem]">{banner.body}</p>
        ) : null}
      </div>
      {banner.href ? (
        <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ember">
          View
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      ) : null}
    </div>
  );

  const shellClass = `relative w-full border-b border-[oklch(0.76_0.1_78_/_0.28)] bg-[oklch(0.14_0.06_22_/_0.72)] backdrop-blur-md ${className}`;

  if (banner.href?.startsWith("/")) {
    return (
      <div className={shellClass}>
        <Link
          to={banner.href}
          className="block transition-colors hover:bg-[oklch(0.18_0.07_22_/_0.55)]"
        >
          {content}
        </Link>
      </div>
    );
  }

  if (banner.href) {
    return (
      <div className={shellClass}>
        <a
          href={banner.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-colors hover:bg-[oklch(0.18_0.07_22_/_0.55)]"
        >
          {content}
        </a>
      </div>
    );
  }

  return <div className={shellClass}>{content}</div>;
}
