import { useCallback, useEffect, useState } from "react";
import { GuestProfileForm } from "@/components/guest/GuestProfileForm";
import { fetchGuestProfile, type GuestProfile } from "@/lib/api/guest";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type AccountProfileSectionProps = {
  accessToken: string;
  ready: boolean;
};

export function AccountProfileSection({ accessToken, ready }: AccountProfileSectionProps) {
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("Profile API is not configured for this deployment.");
      }
      const row = await fetchGuestProfile(accessToken);
      setProfile(row);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load profile."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadProfile();
  }, [loadProfile, ready]);

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

  return (
    <GuestProfileForm
      profile={profile}
      accessToken={accessToken}
      onUpdated={(updated) => setProfile(updated)}
    />
  );
}
