import { useEffect, useState } from "react";
import { fetchAdminHomestayApprovals, fetchAdminHomestayStats } from "@/lib/api/admin-homestays";
import { fetchAdminVipPackageApprovals } from "@/lib/api/admin-vip-packages";
import { fetchAdminStats } from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import type { AdminModule } from "@/components/admin/admin-nav";

export type AdminModuleAlert = {
  id: string;
  label: string;
  count: number;
  to: string;
  search?: Record<string, string>;
};

export type AdminModuleAlertsMap = Record<AdminModule, AdminModuleAlert[]>;

const EMPTY_ALERTS: AdminModuleAlertsMap = {
  experiences: [],
  homestays: [],
  vip: [],
};

function withCount(
  id: string,
  label: string,
  count: number,
  to: string,
  search?: Record<string, string>,
): AdminModuleAlert | null {
  if (!count || count <= 0) return null;
  return { id, label, count, to, search };
}

export function useAdminModuleAlerts(): AdminModuleAlertsMap {
  const { accessToken, role } = useAuthUser();
  const [alerts, setAlerts] = useState<AdminModuleAlertsMap>(EMPTY_ALERTS);

  useEffect(() => {
    if (!accessToken || !isApiConfigured() || role !== "admin") {
      setAlerts(EMPTY_ALERTS);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [experienceStats, homestayStats, homestayApprovals, vipPackages] = await Promise.all([
          fetchAdminStats(accessToken).catch(() => null),
          fetchAdminHomestayStats(accessToken).catch(() => null),
          fetchAdminHomestayApprovals(accessToken).catch(() => []),
          fetchAdminVipPackageApprovals(accessToken).catch(() => []),
        ]);
        if (cancelled) return;

        const experiences = [
          withCount(
            "experience-approvals",
            "New experience requests",
            experienceStats?.pendingExperienceReviews ?? 0,
            "/admin/experiences",
          ),
          withCount(
            "experience-bookings",
            "New booking requests",
            experienceStats?.pendingBookings ?? 0,
            "/admin/bookings",
            { status: "pending" },
          ),
          withCount(
            "experience-cancelled",
            "Cancelled bookings",
            experienceStats?.cancelledBookings ?? 0,
            "/admin/bookings",
            { status: "cancelled" },
          ),
        ].filter(Boolean) as AdminModuleAlert[];

        const homestays = [
          withCount(
            "homestay-approvals",
            "New property requests",
            Math.max(homestayStats?.pendingApprovals ?? 0, homestayApprovals.length),
            "/admin/homestays",
          ),
          withCount(
            "homestay-bookings",
            "New stay requests",
            homestayStats?.pendingBookings ?? 0,
            "/admin/homestay",
          ),
          withCount(
            "homestay-cancelled",
            "Cancelled stays",
            homestayStats?.cancelledBookings ?? 0,
            "/admin/homestay",
          ),
        ].filter(Boolean) as AdminModuleAlert[];

        const vip = [
          withCount(
            "vip-approvals",
            "New package requests",
            vipPackages.length,
            "/admin/vip-packages",
          ),
        ].filter(Boolean) as AdminModuleAlert[];

        setAlerts({ experiences, homestays, vip });
      } catch {
        if (!cancelled) setAlerts(EMPTY_ALERTS);
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accessToken, role]);

  return alerts;
}

export function adminModuleAlertTotal(alerts: AdminModuleAlert[]): number {
  return alerts.reduce((sum, alert) => sum + alert.count, 0);
}
