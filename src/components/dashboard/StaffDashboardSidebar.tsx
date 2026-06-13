import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type StaffNavItem = {
  to: string;
  label: string;
  /** Match only this path (for overview routes). */
  exact?: boolean;
};

type StaffDashboardSidebarProps = {
  items: readonly StaffNavItem[];
  heading: string;
};

function isNavActive(pathname: string, item: StaffNavItem): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const target = item.to.replace(/\/$/, "") || "/";
  if (item.exact) {
    return normalized === target;
  }
  return normalized === target || normalized.startsWith(`${target}/`);
}

export function StaffDashboardSidebar({ items, heading }: StaffDashboardSidebarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <>
      <aside className="hidden shrink-0 lg:block lg:w-56 xl:w-60">
        <nav
          aria-label={`${heading} navigation`}
          className="glass-strong sticky top-[calc(var(--header-height)+1.5rem)] rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-3"
        >
          <div className="eyebrow px-3 pb-2 text-muted-foreground">{heading}</div>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = isNavActive(pathname, item);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "block rounded-sm px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-ember/15 font-medium text-ember"
                        : "text-foreground/85 hover:bg-[oklch(0.88_0.08_86_/_0.08)] hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <nav
        aria-label={`${heading} navigation`}
        className="mb-8 flex gap-2 overflow-x-auto pb-1 lg:hidden"
      >
        {items.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "shrink-0 rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                active
                  ? "border-ember/70 bg-ember/10 text-ember"
                  : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
