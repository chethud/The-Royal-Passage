import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

type GuestDashboardShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Wider content area for multi-column flows like checkout. */
  wide?: boolean;
  /** Hide the default guest role description under the subtitle. */
  showRoleDescription?: boolean;
};

export function GuestDashboardShell({
  title,
  subtitle,
  children,
  wide = false,
  showRoleDescription = true,
}: GuestDashboardShellProps) {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-14 sm:py-20 md:py-24">
        <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <RoleBadge role="guest" />
            <span className="text-sm text-muted-foreground">{ROLE_LABELS.guest} dashboard</span>
          </div>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
          {showRoleDescription ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS.guest}</p>
          ) : null}

          <div className="mt-10">{children}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
