import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole, isGuestAccount, isStaffRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function useGuestAccess() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

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

  useEffect(() => {
    if (!user || !isGuestAccount(role)) {
      setAccessToken(null);
      setTokenLoading(false);
      return;
    }

    setTokenLoading(true);
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      })
      .finally(() => {
        setTokenLoading(false);
      });
  }, [role, user]);

  const ready =
    !loading &&
    !tokenLoading &&
    Boolean(user) &&
    isGuestAccount(role) &&
    Boolean(accessToken);

  return {
    user,
    role,
    accessToken,
    loading: loading || tokenLoading,
    ready,
  };
}
