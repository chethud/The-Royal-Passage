import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export const detailBackLinkClass =
  "inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]";

export const detailSectionLabelClass =
  "text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85";

export const detailEyebrowClass =
  "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]";

type DetailPageShellProps = {
  children: ReactNode;
  jsonLd?: unknown;
};

export function DetailPageShell({ children, jsonLd }: DetailPageShellProps) {
  return (
    <div className="experience-detail-page min-h-screen pt-[var(--header-height)] text-[#F7F1E8]">
      <Header />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {children}
      <Footer />
    </div>
  );
}

export function DetailMainSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`container-page pt-8 pb-14 ${className}`.trim()}>{children}</section>;
}

type DetailBackLinkProps = ComponentProps<typeof Link>;

export function DetailBackLink({ className = "", ...props }: DetailBackLinkProps) {
  return <Link {...props} className={`${detailBackLinkClass} ${className}`.trim()} />;
}

export function DetailHeroGrid({
  gallery,
  content,
  contentClassName = "flex w-full min-w-0 flex-col space-y-6 md:pt-2",
}: {
  gallery: ReactNode;
  content: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
      <div className="w-full md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:self-start">
        {gallery}
      </div>
      <div className={contentClassName}>{content}</div>
    </div>
  );
}

export function DetailCategoryBadge({ children }: { children: ReactNode }) {
  return <div className={`mb-5 inline-flex items-center gap-2 ${detailEyebrowClass}`}>{children}</div>;
}

type DetailLocationBlockProps = {
  locationLine?: string;
  address?: string;
  mapLink?: string;
};

export function DetailLocationBlock({ locationLine, address, mapLink }: DetailLocationBlockProps) {
  if (!locationLine && !address && !mapLink) return null;

  return (
    <div className="flex items-start gap-2 text-sm text-[#D6C8B5]/90">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF6A]" aria-hidden />
      <div>
        {locationLine ? <div>{locationLine}</div> : null}
        {address ? <div className="mt-0.5 text-[#D6C8B5]/75">{address}</div> : null}
        {mapLink ? (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            Get directions
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function DetailTitleRow({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mt-5 flex items-start justify-between gap-4">
      <h1 className="font-display text-3xl uppercase leading-[1.08] tracking-[0.04em] text-[#F7F1E8] sm:text-4xl md:text-[2.65rem]">
        {title}
      </h1>
      {actions ? <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div> : null}
    </div>
  );
}

export function DetailTagline({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 font-display text-base italic leading-relaxed text-[#D6C8B5]/90 sm:text-lg">
      {children}
    </p>
  );
}

export function DetailDivider() {
  return (
    <div className="my-7 h-px bg-gradient-to-r from-transparent via-[rgb(200_162_90/0.35)] to-transparent" />
  );
}

export function DetailStatGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-[rgb(200_162_90/0.28)] text-center sm:text-left">
      {children}
    </dl>
  );
}

export function DetailStatItem({
  label,
  children,
  valueClassName,
}: {
  label: string;
  children: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="px-2 first:pl-0 last:pr-0 sm:px-5">
      <dt className={detailSectionLabelClass}>{label}</dt>
      <dd
        className={
          valueClassName ??
          "mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-[#F7F1E8]"
        }
      >
        {children}
      </dd>
    </div>
  );
}

export function DetailDarkSection({
  label,
  children,
  className = "mt-8",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className={detailSectionLabelClass}>{label}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function DetailBookingSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id="book"
      className={`border-t border-[rgb(200_162_90/0.18)] pt-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export function DetailHomestayBookingSection({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section id="book" className="border-t border-[rgb(200_162_90/0.18)] pb-16 pt-4">
      <div className="container-page py-8 sm:py-10">{children}</div>
    </section>
  );
}
