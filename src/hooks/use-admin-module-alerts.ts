import { useEffect, useState } from "react";
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

function formatStayDates(checkIn: string, checkOut: string): string {
  if (checkIn && checkOut) return `${checkIn} → ${checkOut}`;
  return checkIn || checkOut || "Dates TBD";
}

export function useAdminModuleAlerts(): AdminModuleAlertsMap {
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
  }, [accessToken, isAdmin]);

  return alerts;
}

export function adminModuleAlertTotal(alerts: AdminModuleAlert[]): number {
  return alerts.length;
}
