import { createFileRoute } from "@tanstack/react-router";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [{ title: "Profile — The Royal Passage" }],
  }),
  component: GuestProfilePage,
});

function GuestProfilePage() {
  const { accessToken, ready, loading } = useGuestAccess();

  if (loading || !ready || !accessToken) {
    return (
      <GuestDashboardShell
        title="Profile"
        subtitle="Your contact details for bookings and host communication."
      >
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </GuestDashboardShell>
    );
  }

  return (
    <GuestDashboardShell
      title="Profile"
      subtitle="Your contact details for bookings and host communication."
    >
      <AccountProfileSection accessToken={accessToken} ready={ready} />
    </GuestDashboardShell>
  );
}
