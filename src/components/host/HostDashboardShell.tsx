import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

type HostDashboardShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Hide the default role description under the subtitle. */
  showRoleDescription?: boolean;
};

export function HostDashboardShell({
  title,
  subtitle,
  children,
  showRoleDescription = true,
}: HostDashboardShellProps) {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-8 sm:py-20 md:py-24">
        <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
          <RoleBadge role="host" />
          <span className="text-sm text-muted-foreground">{ROLE_LABELS.host} dashboard</span>
        </div>
        <h1 className="font-display text-2xl tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">{subtitle}</p>
        {showRoleDescription ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS.host}</p>
        ) : null}
        <div className="mt-8 sm:mt-10">{children}</div>
      </section>
      <Footer />
    </div>
  );
}
