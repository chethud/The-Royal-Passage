import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function collectAlertIds(alerts: AdminModuleAlertsMap): string[] {
  return [
    ...alerts.experiences,
    ...alerts.homestays,
    ...alerts.vip,
  ].map((alert) => alert.id);
}

function hasAnyAlerts(alerts: AdminModuleAlertsMap): boolean {
  return (
    alerts.experiences.length > 0 ||
    alerts.homestays.length > 0 ||
    alerts.vip.length > 0
  );
}

function mergeAlerts(
  current: AdminModuleAlertsMap,
  incoming: AdminModuleAlertsMap,
): AdminModuleAlertsMap {
  const mergeList = (a: AdminModuleAlert[], b: AdminModuleAlert[]) => {
    const seen = new Set(a.map((item) => item.id));
    return [...a, ...b.filter((item) => !seen.has(item.id))];
  };
  return {
    experiences: mergeList(current.experiences, incoming.experiences),
    homestays: mergeList(current.homestays, incoming.homestays),
    vip: mergeList(current.vip, incoming.vip),
  };
}

export function useAdminModuleAlerts(): {
  alerts: AdminModuleAlertsMap;
} {
  const { accessToken, role, roles } = useAuthUser();
  const [rawAlerts, setRawAlerts] = useState<AdminModuleAlertsMap>(EMPTY_ALERTS);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => readDismissedAlertIds());
  const [visitAlerts, setVisitAlerts] = useState<AdminModuleAlertsMap | null>(null);
  const visitLockedRef = useRef(false);
  const isAdmin = hasRole(roles, "admin", role);

  const markSeen = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setDismissedIds((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (!changed) return prev;
      writeDismissedAlertIds(next);
      return next;
    });
  }, []);

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
          fetchAdminExperienceApprovals(accessToken, 30).catch(() => []),
          fetchAdminBookings(accessToken, { status: "pending", limit: 40 }).catch(() => []),
          fetchAdminHomestayApprovals(accessToken).catch(() => []),
          fetchAdminHomestayBookings(accessToken, ["pending"]).catch(() => []),
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
    const id = window.setInterval(() => void load(), 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accessToken, isAdmin]);

  const freshAlerts = useMemo(
    () => withoutDismissed(rawAlerts, dismissedIds),
    [dismissedIds, rawAlerts],
  );

  // Once alerts are shown on the dashboard, mark them all seen so the next
  // visit does not require opening each item. Keep this visit's list visible.
  useEffect(() => {
    if (!visitLockedRef.current) {
      if (!hasAnyAlerts(freshAlerts)) return;

      visitLockedRef.current = true;
      setVisitAlerts(freshAlerts);

      const ids = collectAlertIds(freshAlerts);
      // Defer so React Strict Mode remounts do not wipe alerts before paint.
      const timer = window.setTimeout(() => markSeen(ids), 400);
      return () => window.clearTimeout(timer);
    }

    const newcomers = withoutDismissed(rawAlerts, dismissedIds);
    if (!hasAnyAlerts(newcomers)) return;

    setVisitAlerts((prev) => mergeAlerts(prev ?? EMPTY_ALERTS, newcomers));
    const timer = window.setTimeout(() => markSeen(collectAlertIds(newcomers)), 400);
    return () => window.clearTimeout(timer);
  }, [dismissedIds, freshAlerts, markSeen, rawAlerts]);

  return { alerts: visitAlerts ?? freshAlerts };
}

export function adminModuleAlertTotal(alerts: AdminModuleAlert[]): number {
  return alerts.length;
}
