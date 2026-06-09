import { createFileRoute } from "@tanstack/react-router";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/profile")({
  head: () => ({
    meta: [{ title: "Profile — The Royal Passage" }],
  }),
  component: HostProfilePage,
});

function HostProfilePage() {
  const { accessToken, ready, loading } = useHostAccess();

  if (loading || !ready || !accessToken) {
    return (
      <HostDashboardShell
        title="Profile"
        subtitle="Your contact details for host communications and payouts."
      >
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </HostDashboardShell>
    );
  }

  return (
    <HostDashboardShell
      title="Profile"
      subtitle="Your contact details for host communications and payouts."
    >
      <AccountProfileSection accessToken={accessToken} ready={ready} />
    </HostDashboardShell>
  );
}
