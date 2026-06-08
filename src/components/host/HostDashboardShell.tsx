import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { HOST_NAV_ITEMS } from "@/components/host/host-nav";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

type HostDashboardShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function HostDashboardShell({ title, subtitle, children }: HostDashboardShellProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-14 sm:py-20 md:py-24">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <RoleBadge role="host" />
          <span className="text-sm text-muted-foreground">{ROLE_LABELS.host} dashboard</span>
        </div>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground/90">{ROLE_DESCRIPTIONS.host}</p>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <nav className="flex shrink-0 flex-row flex-wrap gap-2 lg:w-52 lg:flex-col">
            {HOST_NAV_ITEMS.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-ember/70 bg-ember/10 text-ember"
                      : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80 hover:border-ember/40"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
