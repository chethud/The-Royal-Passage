import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Crown, Home } from "lucide-react";
import {
  adminModuleHome,
  adminModuleQueuePath,
  resolveAdminModule,
  type AdminModule,
} from "@/components/admin/admin-nav";
import { useNavBadges } from "@/hooks/use-nav-badges";

const modules: {
  id: AdminModule;
  label: string;
  description: string;
  icon: typeof Compass;
}[] = [
  {
    id: "experiences",
    label: "Experiences",
    description: "Bookings, hosts & approvals",
    icon: Compass,
  },
  {
    id: "homestays",
    label: "Homestays",
    description: "Stays, owners & approvals",
    icon: Home,
  },
  {
    id: "vip",
    label: "VIP",
    description: "Packages, owners & approvals",
    icon: Crown,
  },
];

type AdminModuleNavProps = {
  className?: string;
};

export function AdminModuleNav({ className = "" }: AdminModuleNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeModule = resolveAdminModule(pathname);
  const badges = useNavBadges();

  return (
    <nav aria-label="Admin modules" className={`marketplace-module-nav ${className}`}>
      <div className="marketplace-module-nav__inner">
        {modules.map((module) => {
          const active = activeModule === module.id;
          const Icon = module.icon;
          const to = adminModuleHome(module.id);
          const queuePath = adminModuleQueuePath(module.id);
          const pending = badges[queuePath] ?? 0;

          return (
            <div
              key={module.id}
              className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
            >
              <Link
                to={to}
                className="marketplace-module-nav__link"
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="marketplace-module-nav__label">{module.label}</span>
                <span className="marketplace-module-nav__hint">{module.description}</span>
              </Link>
              {pending > 0 ? (
                <Link
                  to={queuePath}
                  className="marketplace-module-nav__badge"
                  aria-label={`${pending} pending ${module.label.toLowerCase()} approval${pending === 1 ? "" : "s"}`}
                  title="View recent approvals"
                >
                  {pending > 9 ? "9+" : pending}
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
