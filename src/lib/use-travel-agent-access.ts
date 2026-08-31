import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRoles, hasRole } from "@/lib/roles";

export function useTravelAgentAccess() {
  const navigate = useNavigate();
  const { user, role, roles, loading, accessToken } = useAuthUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }

    if (role && !hasRole(roles, "travel_agent", role)) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
    }
  }, [loading, navigate, role, roles, user]);

  const ready =
    !loading && Boolean(user) && hasRole(roles, "travel_agent", role) && Boolean(accessToken);

  return {
    user,
    role,
    roles,
    accessToken,
    loading,
    ready,
  };
}
