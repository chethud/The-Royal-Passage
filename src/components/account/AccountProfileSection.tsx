import { useCallback, useEffect, useState } from "react";
import { GuestProfileForm } from "@/components/guest/GuestProfileForm";
import { StaffAccountForm } from "@/components/account/StaffAccountForm";
import type { GuestProfile } from "@/lib/api/guest";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAccountProfile } from "@/lib/profile-browser";
import { isGuestAccount } from "@/lib/roles";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { toErrorMessage } from "@/lib/api/client";

export function AccountProfileSection() {
  const { role, roles } = useAuthUser();
  const showPassport = isGuestAccount(role, roles);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isSupabaseBrowserConfigured()) {
        throw new Error("Supabase is not configured for this deployment.");
      }
      const row = await fetchAccountProfile();
      setProfile(row);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load profile."));
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (pageLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  if (pageError) {
    return (
      <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {pageError}
      </p>
    );
  }

  if (!profile) return null;

  if (showPassport) {
    return <GuestProfileForm profile={profile} onUpdated={(updated) => setProfile(updated)} />;
  }

  return <StaffAccountForm profile={profile} onUpdated={(updated) => setProfile(updated)} />;
}
