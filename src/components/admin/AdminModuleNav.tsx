import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Compass, Crown, Home } from "lucide-react";
import {
  adminModuleHome,
  adminModuleHostRequestsPath,
  adminModulePendingBookingsPath,
  resolveAdminModule,
  type AdminModule,
} from "@/components/admin/admin-nav";
import {
  useAdminModuleAlerts,
} from "@/hooks/use-admin-module-alerts";
import { writeAdminModulePreference } from "@/lib/admin-module-selection";

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

function preferModule(module: AdminModule) {
  writeAdminModulePreference(module);
}

export function AdminModuleNav({ className = "" }: AdminModuleNavProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeModule = resolveAdminModule(pathname);
  const { counts: countsByModule } = useAdminModuleAlerts();

  const goTo = (module: AdminModule, to: string) => {
    preferModule(module);
    void navigate({ to });
  };

  return (
    <nav aria-label="Admin modules" className={`marketplace-module-nav ${className}`}>
      <div className="marketplace-module-nav__inner">
        {modules.map((module) => {
          const active = activeModule === module.id;
          const Icon = module.icon;
          const homePath = adminModuleHome(module.id);
          const counts = countsByModule[module.id];
          const hostPath = adminModuleHostRequestsPath(module.id);
          const userPath = adminModulePendingBookingsPath(module.id);

          return (
            <div key={module.id} className="marketplace-module-nav__column">
              <div
                className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
              >
                <Link
                  to={homePath}
                  className="marketplace-module-nav__link"
                  aria-current={active ? "page" : undefined}
                  onClick={() => preferModule(module.id)}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="marketplace-module-nav__label">{module.label}</span>
                  <span className="marketplace-module-nav__hint">{module.description}</span>
                </Link>
              </div>

              <div className="marketplace-module-nav__notify" aria-label={`${module.label} notifications`}>
                <NotifyCard
                  title="Host requests"
                  detail="Listing approvals"
                  count={counts.hostRequests}
                  onClick={() => goTo(module.id, hostPath)}
                />
                <NotifyCard
                  title="User pending"
                  detail={
                    counts.userOverdue > 0
                      ? `${counts.userOverdue} overdue (1h+)`
                      : "Bookings awaiting accept"
                  }
                  count={counts.userPending}
                  overdue={counts.userOverdue > 0}
                  onClick={() => goTo(module.id, userPath)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function NotifyCard({
  title,
  detail,
  count,
  overdue = false,
  onClick,
}: {
  title: string;
  detail: string;
  count: number;
  overdue?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`marketplace-module-nav__notify-card${overdue ? " marketplace-module-nav__notify-card--overdue" : ""}${count > 0 ? " marketplace-module-nav__notify-card--active" : ""}`}
      onClick={onClick}
    >
      <span className="marketplace-module-nav__notify-count">{count}</span>
      <span className="marketplace-module-nav__notify-copy">
        <span className="marketplace-module-nav__notify-title">{title}</span>
        <span className="marketplace-module-nav__notify-detail">{detail}</span>
      </span>
      <span className="marketplace-module-nav__notify-arrow" aria-hidden>
        →
      </span>
    </button>
  );
}
