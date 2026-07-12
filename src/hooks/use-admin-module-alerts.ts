import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdminHomestayApprovals,
  fetchAdminHomestayBookings,
} from "@/lib/api/admin-homestays";
import { fetchAdminVipPackageApprovals } from "@/lib/api/admin-vip-packages";
import {
  fetchAdminBookings,
  fetchAdminExperienceApprovals,
} from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { hasRole } from "@/lib/roles";
import type { AdminModule } from "@/components/admin/admin-nav";

export type AdminModuleAlert = {
  id: string;
  /** Property / experience / package name */
  label: string;
  /** Guest, dates, and what happened */
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

const DISMISSED_ALERTS_KEY = "rp_admin_module_alerts_dismissed_v1";

function formatStayDates(checkIn: string, checkOut: string): string {
  if (checkIn && checkOut) return `${checkIn} → ${checkOut}`;
  return checkIn || checkOut || "Dates TBD";
}

function readDismissedAlertIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeDismissedAlertIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...ids]));
}

function withoutDismissed(
  alerts: AdminModuleAlertsMap,
  dismissed: Set<string>,
): AdminModuleAlertsMap {
  return {
    experiences: alerts.experiences.filter((alert) => !dismissed.has(alert.id)),
    homestays: alerts.homestays.filter((alert) => !dismissed.has(alert.id)),
    vip: alerts.vip.filter((alert) => !dismissed.has(alert.id)),
  };
}

export function useAdminModuleAlerts(): {
  alerts: AdminModuleAlertsMap;
  dismissAlert: (alertId: string) => void;
} {
  const { accessToken, role, roles } = useAuthUser();
  const [rawAlerts, setRawAlerts] = useState<AdminModuleAlertsMap>(EMPTY_ALERTS);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => readDismissedAlertIds());
  const isAdmin = hasRole(roles, "admin", role);

  useEffect(() => {
    if (!accessToken || !isApiConfigured() || !isAdmin) {
      setRawAlerts(EMPTY_ALERTS);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [
          experienceApprovals,
          experienceBookings,
          homestayApprovals,
          homestayBookings,
          vipPackages,
        ] = await Promise.all([
          fetchAdminExperienceApprovals(accessToken).catch(() => []),
          fetchAdminBookings(accessToken).catch(() => []),
          fetchAdminHomestayApprovals(accessToken).catch(() => []),
          fetchAdminHomestayBookings(accessToken, ["pending", "cancelled"]).catch(() => []),
          fetchAdminVipPackageApprovals(accessToken).catch(() => []),
        ]);
        if (cancelled) return;

        const experiences: AdminModuleAlert[] = [
          ...experienceApprovals.map((row) => ({
            id: `exp-approval-${row.id}`,
            label: row.title,
            detail: `New experience request · ${row.hostName || "Host"} · ${row.city || "Mysuru"}`,
            status: "Review",
            to: `/admin/experiences/${row.id}`,
          })),
          ...experienceBookings
            .filter((row) => row.bookingStatus === "pending")
            .map((row) => ({
              id: `exp-pending-${row.id}`,
              label: row.experienceTitle,
              detail: `${row.guestName?.trim() || "Guest"} · ${row.slotDate || "Date TBD"} · new booking request`,
              status: "Pending",
              to: `/admin/bookings/${row.id}`,
            })),
          ...experienceBookings
            .filter((row) => row.bookingStatus === "cancelled")
            .map((row) => ({
              id: `exp-cancelled-${row.id}`,
              label: row.experienceTitle,
              detail: `${row.guestName?.trim() || "Guest"} · ${row.slotDate || "Date TBD"} · cancelled booking`,
              status: "Cancelled",
              to: `/admin/bookings/${row.id}`,
            })),
        ];

        const pendingHomestays = homestayApprovals.filter(
          (row) => row.status === "pending_review" || !row.status,
        );

        const homestays: AdminModuleAlert[] = [
          ...pendingHomestays.map((row) => ({
            id: `stay-approval-${row.id}`,
            label: row.title,
            detail: `New property request · ${row.ownerName || "Owner"} · ${row.city || "Mysuru"}`,
            status: "Review",
            to: `/admin/homestays/${row.id}`,
          })),
          ...homestayBookings
            .filter((row) => row.bookingStatus === "pending")
            .map((row) => ({
              id: `stay-pending-${row.id}`,
              label: row.homestayTitle,
              detail: `${row.guestName?.trim() || "Guest"} · ${formatStayDates(row.checkIn, row.checkOut)} · new stay request`,
              status: "Pending",
              to: "/admin/homestay",
            })),
          ...homestayBookings
            .filter((row) => row.bookingStatus === "cancelled")
            .map((row) => ({
              id: `stay-cancelled-${row.id}`,
              label: row.homestayTitle,
              detail: `${row.guestName?.trim() || "Guest"} · ${formatStayDates(row.checkIn, row.checkOut)} · cancelled stay`,
              status: "Cancelled",
              to: "/admin/homestay",
            })),
        ];

        const vip: AdminModuleAlert[] = vipPackages.map((row) => ({
          id: `vip-approval-${row.id}`,
          label: row.title,
          detail: `New package request · ${row.ownerName || "Owner"} · ${row.city || "Mysuru"}`,
          status: "Review",
          to: `/admin/vip-packages/${row.id}`,
        }));

        setRawAlerts({ experiences, homestays, vip });
      } catch {
        if (!cancelled) setRawAlerts(EMPTY_ALERTS);
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accessToken, isAdmin]);

  const dismissAlert = useCallback((alertId: string) => {
    setDismissedIds((prev) => {
      if (prev.has(alertId)) return prev;
      const next = new Set(prev);
      next.add(alertId);
      writeDismissedAlertIds(next);
      return next;
    });
  }, []);

  const alerts = useMemo(
    () => withoutDismissed(rawAlerts, dismissedIds),
    [dismissedIds, rawAlerts],
  );

  return { alerts, dismissAlert };
}

export function adminModuleAlertTotal(alerts: AdminModuleAlert[]): number {
  return alerts.length;
}
