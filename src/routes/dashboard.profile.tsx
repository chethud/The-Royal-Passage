import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestProfileForm } from "@/components/guest/GuestProfileForm";
import { getGuestProfile, type GuestProfile } from "@/lib/guest-fns";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [{ title: "Profile — The Royal Passage" }],
  }),
  component: GuestProfilePage,
});

function GuestProfilePage() {
  const { accessToken, ready, loading } = useGuestAccess();
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

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="Profile"
      subtitle="Your contact details for bookings and host communication."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : profile ? (
        <GuestProfileForm
          profile={profile}
          accessToken={accessToken}
          onUpdated={(updated) => setProfile(updated)}
        />
      ) : null}
    </GuestDashboardShell>
  );
}
