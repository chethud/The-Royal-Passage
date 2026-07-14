import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Compass, Crown, Home } from "lucide-react";
import {
  adminModuleHome,
  resolveAdminModule,
  type AdminModule,
} from "@/components/admin/admin-nav";
import {
  adminModuleAlertTotal,
  useAdminModuleAlerts,
  type AdminModuleAlert,
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

function alertHref(alert: Pick<AdminModuleAlert, "to" | "search">): string {
  if (!alert.search || Object.keys(alert.search).length === 0) return alert.to;
  const params = new URLSearchParams(alert.search);
  return `${alert.to}?${params.toString()}`;
}

export function AdminModuleNav({ className = "" }: AdminModuleNavProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeModule = resolveAdminModule(pathname);
  const { alerts: alertsByModule } = useAdminModuleAlerts();

  const selectModule = (module: AdminModule) => {
    writeAdminModulePreference(module);
  };

  const goToAlert = (target: Pick<AdminModuleAlert, "to" | "search">) => {
    if (target.to.startsWith("/admin/homestay") || target.to.startsWith("/admin/homestays")) {
      writeAdminModulePreference("homestays");
    } else if (target.to.startsWith("/admin/vip")) {
      writeAdminModulePreference("vip");
    } else {
      writeAdminModulePreference("experiences");
    }

    if (target.search && Object.keys(target.search).length > 0) {
      void navigate({ to: target.to, search: target.search });
      return;
    }
    void navigate({ to: target.to });
  };

  return (
    <nav aria-label="Admin modules" className={`marketplace-module-nav ${className}`}>
      <div className="marketplace-module-nav__inner">
        {modules.map((module) => {
          const active = activeModule === module.id;
          const Icon = module.icon;
          const homePath = adminModuleHome(module.id);
          const alerts = alertsByModule[module.id];
          const pendingTotal = adminModuleAlertTotal(alerts);
          const primaryAlert = alerts[0];

          return (
            <div key={module.id} className="marketplace-module-nav__column">
              <div
                className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
              >
                <Link
                  to={homePath}
                  className="marketplace-module-nav__link"
                  aria-current={active ? "page" : undefined}
                  onClick={() => selectModule(module.id)}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="marketplace-module-nav__label">{module.label}</span>
                  <span className="marketplace-module-nav__hint">{module.description}</span>
                </Link>
                {pendingTotal > 0 && primaryAlert ? (
                  <a
                    href={alertHref(primaryAlert)}
                    className="marketplace-module-nav__badge"
                    aria-label={`${pendingTotal} new requests for ${module.label}`}
                    title="View latest request"
                    onClick={(event) => {
                      event.preventDefault();
                      goToAlert(primaryAlert);
                    }}
                  >
                    {pendingTotal}
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
                          goToAlert(alert);
                        }}
                      >
                        <span className="marketplace-module-nav__alert-status">{alert.status}</span>
                        <span className="marketplace-module-nav__alert-copy">
                          <span className="marketplace-module-nav__alert-label">{alert.label}</span>
                          <span className="marketplace-module-nav__alert-detail">{alert.detail}</span>
                        </span>
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
