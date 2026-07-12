import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Compass, Crown, Home } from "lucide-react";
import {
  adminModuleHome,
  adminModuleQueuePath,
  resolveAdminModule,
  type AdminModule,
} from "@/components/admin/admin-nav";
import {
  adminModuleAlertTotal,
  useAdminModuleAlerts,
  type AdminModuleAlert,
} from "@/hooks/use-admin-module-alerts";

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

function alertHref(alert: Pick<AdminModuleAlert, "to" | "search">): string {
  if (!alert.search || Object.keys(alert.search).length === 0) return alert.to;
  const params = new URLSearchParams(alert.search);
  return `${alert.to}?${params.toString()}`;
}

export function AdminModuleNav({ className = "" }: AdminModuleNavProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeModule = resolveAdminModule(pathname);
  const alertsByModule = useAdminModuleAlerts();

  const goTo = (target: Pick<AdminModuleAlert, "to" | "search">) => {
    void navigate({
      to: target.to,
      search: target.search,
    });
  };

  return (
    <nav aria-label="Admin modules" className={`marketplace-module-nav ${className}`}>
      <div className="marketplace-module-nav__inner">
        {modules.map((module) => {
          const active = activeModule === module.id;
          const Icon = module.icon;
          const homePath = adminModuleHome(module.id);
          const queuePath = adminModuleQueuePath(module.id);
          const alerts = alertsByModule[module.id];
          const pendingTotal = adminModuleAlertTotal(alerts);
          const primaryAlert = alerts[0] ?? { to: queuePath, search: undefined };

          return (
            <div key={module.id} className="marketplace-module-nav__column">
              <div
                className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
              >
                <button
                  type="button"
                  className="marketplace-module-nav__link"
                  aria-current={active ? "page" : undefined}
                  onClick={() => goTo({ to: homePath })}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="marketplace-module-nav__label">{module.label}</span>
                  <span className="marketplace-module-nav__hint">{module.description}</span>
                </button>
                {pendingTotal > 0 ? (
                  <a
                    href={alertHref(primaryAlert)}
                    className="marketplace-module-nav__badge"
                    aria-label={`${pendingTotal} new items for ${module.label}`}
                    title="View latest updates"
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(primaryAlert);
                    }}
                  >
                    {pendingTotal > 9 ? "9+" : pendingTotal}
                  </a>
                ) : null}
              </div>

              {alerts.length > 0 ? (
                <ul className="marketplace-module-nav__alerts" aria-label={`${module.label} updates`}>
                  {alerts.map((alert) => (
                    <li key={alert.id}>
                      <a
                        href={alertHref(alert)}
                        className="marketplace-module-nav__alert"
                        onClick={(event) => {
                          event.preventDefault();
                          goTo(alert);
                        }}
                      >
                        <span className="marketplace-module-nav__alert-count">
                          {alert.count > 9 ? "9+" : alert.count}
                        </span>
                        <span className="marketplace-module-nav__alert-label">{alert.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="marketplace-module-nav__alerts-empty">No new updates</p>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
