import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

type GuestDashboardShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Wider content area for multi-column flows like checkout. */
  wide?: boolean;
  /** Hide the default guest role description under the subtitle. */
  showRoleDescription?: boolean;
  /** Hide badge, dashboard label, and page title — for passport-style profile. */
  showPageHeader?: boolean;
};

export function GuestDashboardShell({
  title,
  subtitle,
  children,
  wide = false,
  showRoleDescription = true,
  showPageHeader = true,
}: GuestDashboardShellProps) {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-4 sm:py-14 md:py-20">
        <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          {showPageHeader ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-8 sm:gap-3">
                <RoleBadge role="guest" />
                <span className="text-[0.7rem] text-muted-foreground sm:text-sm">
                  {ROLE_LABELS.guest} dashboard
                </span>
              </div>
              <h1 className="font-display text-xl tracking-tight sm:text-3xl md:text-5xl">{title}</h1>
              {subtitle ? (
                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
                  {subtitle}
                </p>
              ) : null}
              {showRoleDescription ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS.guest}</p>
              ) : null}
            </>
          ) : null}

          <div className={showPageHeader ? "mt-4 sm:mt-10" : undefined}>{children}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
