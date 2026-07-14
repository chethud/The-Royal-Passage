import { useEffect, useState } from "react";
import { fetchAdminHomestayApprovals } from "@/lib/api/admin-homestays";
import { fetchAdminExperienceApprovals } from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { hasRole } from "@/lib/roles";
import type { AdminModule } from "@/components/admin/admin-nav";

export type AdminModuleAlert = {
  id: string;
  /** Property / experience name */
  label: string;
  /** Owner/host and what needs review */
  detail: string;
  /** Short status chip */
  status: string;
  to: string;
  search?: Record<string, string>;
};

export type AdminModuleAlertsMap = Record<AdminModule, AdminModuleAlert[]>;

const EMPTY_ALERTS: AdminModuleAlertsMap = {
  experiences: [],
  homestays: [],
  vip: [],
};

/**
 * Overview notifications for pending listing approvals only.
 * Alerts stay until the admin accepts or rejects (item leaves the approval queue).
 */
export function useAdminModuleAlerts(): {
  alerts: AdminModuleAlertsMap;
} {
  const { accessToken, role, roles } = useAuthUser();
  const [alerts, setAlerts] = useState<AdminModuleAlertsMap>(EMPTY_ALERTS);
  const isAdmin = hasRole(roles, "admin", role);

  useEffect(() => {
    if (!accessToken || !isApiConfigured() || !isAdmin) {
      setAlerts(EMPTY_ALERTS);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [experienceApprovals, homestayApprovals] = await Promise.all([
          fetchAdminExperienceApprovals(accessToken, 30).catch(() => []),
          fetchAdminHomestayApprovals(accessToken).catch(() => []),
        ]);
        if (cancelled) return;

        const experiences: AdminModuleAlert[] = experienceApprovals.map((row) => ({
          id: `exp-approval-${row.id}`,
          label: row.title,
          detail: `Approve experience · ${row.hostName || "Host"} · ${row.city || "Mysuru"}`,
          status: "Review",
          to: `/admin/experiences/${row.id}`,
        }));

        const pendingHomestays = homestayApprovals.filter(
          (row) => row.status === "pending_review" || !row.status,
        );

        const homestays: AdminModuleAlert[] = pendingHomestays.map((row) => ({
          id: `stay-approval-${row.id}`,
          label: row.title,
          detail: `Approve homestay · ${row.ownerName || "Owner"} · ${row.city || "Mysuru"}`,
          status: "Review",
          to: `/admin/homestays/${row.id}`,
        }));

        setAlerts({ experiences, homestays, vip: [] });
      } catch {
        if (!cancelled) setAlerts(EMPTY_ALERTS);
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accessToken, isAdmin]);

  return { alerts };
}

export function adminModuleAlertTotal(alerts: AdminModuleAlert[]): number {
  return alerts.length;
}
