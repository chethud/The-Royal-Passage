import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type UserRole } from "@/lib/roles";

type DashboardShellProps = {
  role: UserRole;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Hide the default role description under the subtitle. */
  showRoleDescription?: boolean;
};

export function DashboardShell({
  role,
  title,
  subtitle,
  children,
  showRoleDescription = true,
}: DashboardShellProps) {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14 md:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <RoleBadge role={role} />
          <span className="text-sm text-muted-foreground">{ROLE_LABELS[role]} dashboard</span>
        </div>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        {showRoleDescription ? (
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground/90">{ROLE_DESCRIPTIONS[role]}</p>
        ) : null}
        <div className="mt-8">{children}</div>
      </section>
      <Footer />
    </div>
  );
}
