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
      <section
        className={
          isIvoryShell
            ? "container-page py-14 sm:py-20 md:py-24"
            : "container-page py-10 sm:py-14 md:py-16"
        }
      >
        {isIvoryShell ? (
          <div className="mb-8">
            <AdminModuleNav />
          </div>
        ) : null}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <RoleBadge role={role} />
          <span className="text-sm text-muted-foreground">
            {adminModule ? adminModuleLabel(adminModule) : `${ROLE_LABELS[role]} dashboard`}
          </span>
        </div>
        <h1
          className={
            isIvoryShell
              ? "font-display text-4xl tracking-tight md:text-5xl"
              : "font-display text-3xl tracking-tight md:text-4xl"
          }
        >
          {title}
        </h1>
        <p
          className={
            isIvoryShell
              ? "mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground"
              : "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          }
        >
          {subtitle}
        </p>
        {showRoleDescription ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS[role]}</p>
        ) : null}
        <div className={isIvoryShell ? "mt-10" : "mt-8"}>{children}</div>
      </section>
      <Footer />
    </div>
  );
}
