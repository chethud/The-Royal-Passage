import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole, isGuestAccount, isStaffRole } from "@/lib/roles";

export function useGuestAccess() {
  const navigate = useNavigate();
  const { user, role, loading, accessToken } = useAuthUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }

    if (isStaffRole(role)) {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  const ready =
    !loading && Boolean(user) && isGuestAccount(role) && Boolean(accessToken);

  return {
    user,
    role,
    accessToken,
    loading,
    ready,
  };
}
