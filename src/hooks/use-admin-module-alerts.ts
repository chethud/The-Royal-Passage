import { useEffect, useState } from "react";
import { fetchAdminHomestayApprovals, fetchAdminHomestayBookings } from "@/lib/api/admin-homestays";
import { fetchAdminVipPackageApprovals } from "@/lib/api/admin-vip-packages";
import { fetchAdminBookings, fetchAdminExperienceApprovals } from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { countPendingPartnerExperienceApplications } from "@/lib/partner-experience-fns";
import { countPendingPartnerHomestayApplications } from "@/lib/partner-homestay-fns";
import { hasRole } from "@/lib/roles";
import type { AdminModule } from "@/components/admin/admin-nav";

export type ModuleNotifyCounts = {
  hostRequests: number;
  userPending: number;
  /** Pending bookings older than 1 hour awaiting host/owner accept. */
  userOverdue: number;
};

export type AdminModuleNotifyMap = Record<AdminModule, ModuleNotifyCounts>;

const EMPTY_COUNTS: ModuleNotifyCounts = {
  hostRequests: 0,
  userPending: 0,
  userOverdue: 0,
};

const EMPTY_MAP: AdminModuleNotifyMap = {
  experiences: { ...EMPTY_COUNTS },
  homestays: { ...EMPTY_COUNTS },
  vip: { ...EMPTY_COUNTS },
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export function isPendingBookingOverdue(createdAt: string, nowMs = Date.now()): boolean {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return nowMs - created >= ONE_HOUR_MS;
}

function countOverdue(createdAts: string[], nowMs: number): number {
  return createdAts.filter((createdAt) => isPendingBookingOverdue(createdAt, nowMs)).length;
}

/**
 * Overview notification counts: host listing approvals + guest bookings still pending accept.
 */
export function useAdminModuleAlerts(): {
  counts: AdminModuleNotifyMap;
} {
  const { accessToken, role, roles } = useAuthUser();
  const [counts, setCounts] = useState<AdminModuleNotifyMap>(EMPTY_MAP);
  const isAdmin = hasRole(roles, "admin", role);

  useEffect(() => {
    if (!accessToken || !isApiConfigured() || !isAdmin) {
      setCounts(EMPTY_MAP);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const nowMs = Date.now();
        const [
          experienceApprovals,
          partnerExperienceAppsCount,
          homestayApprovals,
          partnerHomestayAppsCount,
          vipApprovals,
          experiencePendingBookings,
          homestayPendingBookings,
        ] = await Promise.all([
          fetchAdminExperienceApprovals(accessToken, 100).catch(() => []),
          countPendingPartnerExperienceApplications({ data: { accessToken } }).catch(() => 0),
          fetchAdminHomestayApprovals(accessToken).catch(() => []),
          countPendingPartnerHomestayApplications({ data: { accessToken } }).catch(() => 0),
          fetchAdminVipPackageApprovals(accessToken).catch(() => []),
          fetchAdminBookings(accessToken, { status: "pending", limit: 200 }).catch(() => []),
          fetchAdminHomestayBookings(accessToken, "pending").catch(() => []),
        ]);
        if (cancelled) return;

        const pendingHomestays = homestayApprovals.filter(
          (row) => row.status === "pending_review" || !row.status,
        );
        const pendingVip = vipApprovals.filter(
          (row) => row.status === "pending_review" || !row.status,
        );

        const expPendingCreated = experiencePendingBookings.map((row) => row.createdAt);
        const stayPendingCreated = homestayPendingBookings.map((row) => row.createdAt);

        setCounts({
          experiences: {
            hostRequests: experienceApprovals.length + partnerExperienceAppsCount,
            userPending: experiencePendingBookings.length,
            userOverdue: countOverdue(expPendingCreated, nowMs),
          },
          homestays: {
            hostRequests: pendingHomestays.length + partnerHomestayAppsCount,
            userPending: homestayPendingBookings.length,
            userOverdue: countOverdue(stayPendingCreated, nowMs),
          },
          vip: {
            hostRequests: pendingVip.length,
            userPending: 0,
            userOverdue: 0,
          },
        });
      } catch {
        if (!cancelled) setCounts(EMPTY_MAP);
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accessToken, isAdmin]);

  return { counts };
}

export function adminModuleNotifyTotal(counts: ModuleNotifyCounts): number {
  return counts.hostRequests + counts.userPending;
}
