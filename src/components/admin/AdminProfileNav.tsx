import { Link, useRouterState } from "@tanstack/react-router";

const ADMIN_PROFILE_NAV = [
  { to: "/admin/profile", label: "Account" },
  { to: "/admin/profile/users", label: "Users" },
  { to: "/admin/profile/homepage-photos", label: "Homepage photos" },
] as const;

const linkClass =
  "rounded-sm px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/75 transition-colors hover:text-ember";
const activeClass = " border-b-2 border-ember text-ember";

export function AdminProfileNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-[oklch(0.88_0.08_86_/_0.2)] pb-1"
      aria-label="Profile sections"
    >
      {ADMIN_PROFILE_NAV.map((item) => {
        const active =
          item.to === "/admin/profile"
            ? pathname === "/admin/profile" || pathname === "/admin/profile/"
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`${linkClass}${active ? activeClass : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
