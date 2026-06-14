import { useCallback, useEffect, useState } from "react";
import { GuestProfileForm } from "@/components/guest/GuestProfileForm";
import type { GuestProfile } from "@/lib/api/guest";
import { fetchAccountProfile } from "@/lib/profile-browser";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { toErrorMessage } from "@/lib/api/client";

export function AccountProfileSection() {
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

  return <GuestProfileForm profile={profile} onUpdated={(updated) => setProfile(updated)} />;
}
