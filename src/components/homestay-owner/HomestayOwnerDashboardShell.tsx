import type { ReactNode } from "react";
import heroPalaceImg from "@/assets/hero-image.png";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { OrnamentalDivider } from "@/components/site/RoyalHeritageDecor";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

type HomestayOwnerDashboardShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showRoleDescription?: boolean;
  variant?: "default" | "overview" | "bookings" | "revenue" | "offers" | "reviews" | "experiences";
};

export function HomestayOwnerDashboardShell({
  title,
  subtitle,
  children,
  showRoleDescription = true,
  variant = "default",
}: HomestayOwnerDashboardShellProps) {
  const isRoyalHero =
    variant === "overview" ||
    variant === "bookings" ||
    variant === "revenue" ||
    variant === "offers" ||
    variant === "reviews" ||
    variant === "experiences";

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section
        className={`container-page ${isRoyalHero ? "py-8 sm:py-12 md:py-14" : "py-8 sm:py-20 md:py-24"}`}
      >
        {isRoyalHero ? (
          <header
            className={`host-overview-hero ${
              variant === "bookings" ||
              variant === "revenue" ||
              variant === "offers" ||
              variant === "reviews" ||
              variant === "experiences"
                ? "host-overview-hero--bookings"
                : ""
            }`}
          >
            <div
              className="host-overview-hero__palace-bg"
              aria-hidden
              style={{ backgroundImage: `url(${heroPalaceImg})` }}
            />
            <div className="relative z-[1]">
              <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
                <RoleBadge
                  role="homestay_owner"
                  className="border-[rgb(184_148_70/0.55)] bg-[rgb(184_148_70/0.08)] text-[rgb(212_175_55/0.92)]"
                />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[rgb(212_175_55/0.72)]">
                  {ROLE_LABELS.homestay_owner} dashboard
                </span>
              </div>
              <h1 className="font-display text-4xl tracking-[0.04em] text-[#F7F1E8] sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <OrnamentalDivider className="host-overview-hero__divider" />
              <p className="mt-3 max-w-xl text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[rgb(212_175_55/0.78)] sm:mt-4 sm:text-[0.78rem]">
                {subtitle}
              </p>
              {showRoleDescription ? (
                <p className="mt-2 max-w-xl text-[0.68rem] uppercase tracking-[0.12em] text-[rgb(212_175_55/0.58)]">
                  {ROLE_DESCRIPTIONS.homestay_owner}
                </p>
              ) : null}
            </div>
          </header>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
              <RoleBadge role="homestay_owner" />
              <span className="text-sm text-muted-foreground">{ROLE_LABELS.homestay_owner} dashboard</span>
            </div>
            <h1 className="font-display text-2xl tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              {subtitle}
            </p>
            {showRoleDescription ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">
                {ROLE_DESCRIPTIONS.homestay_owner}
              </p>
            ) : null}
          </>
        )}
        <div
          className={
            variant === "overview"
              ? "mt-10 sm:mt-12 md:mt-14"
              : variant === "bookings" ||
                  variant === "revenue" ||
                  variant === "offers" ||
                  variant === "reviews" ||
                  variant === "experiences"
                ? "mt-6 sm:mt-7 md:mt-8"
                : "mt-8 sm:mt-10"
          }
        >
          {children}
        </div>
      </section>
      <Footer />
    </div>
  );
}
