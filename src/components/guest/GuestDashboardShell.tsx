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
};

export function GuestDashboardShell({ title, subtitle, children, wide = false }: GuestDashboardShellProps) {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-8 sm:py-12 md:py-14">
        <div className={`mx-auto ${wide ? "max-w-4xl" : "max-w-3xl"}`}>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <RoleBadge role="guest" />
            <span className="text-xs text-muted-foreground">{ROLE_LABELS.guest} dashboard</span>
          </div>
          <h1 className="font-display text-3xl tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground/90">{ROLE_DESCRIPTIONS.guest}</p>

          <div className="mt-8">{children}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
