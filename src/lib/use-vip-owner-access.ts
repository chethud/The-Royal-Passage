import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";

export function useVipOwnerAccess() {
  const navigate = useNavigate();
  const { user, role, loading, accessToken } = useAuthUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }

    if (role && role !== "vip_owner") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  const ready = !loading && Boolean(user) && role === "vip_owner" && Boolean(accessToken);

  return {
    user,
    role,
    accessToken,
    loading,
    ready,
  };
}
