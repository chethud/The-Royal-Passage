import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AdminModuleNav } from "@/components/admin/AdminModuleNav";
import { adminModuleLabel, resolveAdminModule } from "@/components/admin/admin-nav";
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
  const isIvoryShell = role === "admin";
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const adminModule = isIvoryShell ? resolveAdminModule(pathname) : null;

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page w-full py-6 sm:py-16 md:py-24">
        {isIvoryShell ? (
          <div className="mb-6 sm:mb-8">
            <AdminModuleNav />
          </div>
        ) : null}
        <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
          <RoleBadge role={role} />
          <span className="text-sm text-muted-foreground">
            {adminModule ? adminModuleLabel(adminModule) : `${ROLE_LABELS[role]} dashboard`}
          </span>
        </div>
        <h1 className="font-display text-2xl tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">{subtitle}</p>
        {showRoleDescription ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS[role]}</p>
        ) : null}
        <div className="mt-8 sm:mt-10">{children}</div>
      </section>
      <Footer />
    </div>
  );
}
