import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { StaffDashboardSidebar } from "@/components/dashboard/StaffDashboardSidebar";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type UserRole } from "@/lib/roles";

type DashboardShellProps = {
  role: UserRole;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function DashboardShell({ role, title, subtitle, children }: DashboardShellProps) {
  const navItems =
    role === "admin"
      ? ADMIN_NAV_ITEMS.map((item) => ({
          ...item,
          exact: item.to === "/admin",
        }))
      : [];

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-14 sm:py-20 md:py-24">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <RoleBadge role={role} />
          <span className="text-sm text-muted-foreground">{ROLE_LABELS[role]} dashboard</span>
        </div>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS[role]}</p>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
          {navItems.length > 0 ? (
            <StaffDashboardSidebar items={navItems} heading="Admin menu" />
          ) : null}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
