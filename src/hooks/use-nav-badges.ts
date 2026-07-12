import { useEffect, useState } from "react";
import { fetchAdminHomestayApprovals } from "@/lib/api/admin-homestays";
import { fetchAdminVipPackageApprovals } from "@/lib/api/admin-vip-packages";
import { fetchAdminStats } from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/api/client";
import { fetchHostDashboard } from "@/lib/api/host";
import { useAuthUser } from "@/lib/auth-user";

export type NavBadgeMap = Record<string, number>;

export function useNavBadges(): NavBadgeMap {
  const { accessToken, role } = useAuthUser();
  const [badges, setBadges] = useState<NavBadgeMap>({});

  useEffect(() => {
    if (!accessToken || !isApiConfigured()) {
      setBadges({});
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        if (role === "admin") {
          const [stats, homestays, vipPackages] = await Promise.all([
            fetchAdminStats(accessToken),
            fetchAdminHomestayApprovals(accessToken).catch(() => []),
            fetchAdminVipPackageApprovals(accessToken).catch(() => []),
          ]);
          if (cancelled) return;
          setBadges({
            "/admin/experiences": stats.pendingExperienceReviews,
            "/admin/homestays": homestays.length,
            "/admin/vip-packages": vipPackages.length,
          });
          return;
        }

        if (role === "host") {
          const stats = await fetchHostDashboard(accessToken);
          if (cancelled) return;
          setBadges({
            "/host/bookings": stats.pendingBookings,
          });
          return;
        }

        if (!cancelled) setBadges({});
      } catch {
        if (!cancelled) setBadges({});
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accessToken, role]);

  return badges;
}
