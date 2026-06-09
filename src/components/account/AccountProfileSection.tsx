import { useCallback, useEffect, useState } from "react";
import { GuestProfileForm } from "@/components/guest/GuestProfileForm";
import { getGuestProfile, type GuestProfile } from "@/lib/guest-fns";

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
      const row = await getGuestProfile({ data: { accessToken } });
      setProfile(row);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load profile.");
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
