import { createFileRoute } from "@tanstack/react-router";
import { HostOverviewActionPanel } from "@/components/host/HostOverviewActionPanel";
import { TravelAgentDashboardShell } from "@/components/travel-agent/TravelAgentDashboardShell";
import { useTravelAgentAccess } from "@/lib/use-travel-agent-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/travel-agent/catalog")({
  head: () => ({
    meta: [{ title: "Book for client — Travel agent — The Royal Passage" }],
  }),
  component: TravelAgentCatalogPage,
});

function TravelAgentCatalogPage() {
  const { ready, loading } = useTravelAgentAccess();

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <TravelAgentDashboardShell
      title="Book for client"
      subtitle="Choose an experience or homestay, enter customer details, add your markup, and confirm."
      showRoleDescription={false}
      variant="catalog"
    >
      <div className="host-overview-stack">
        <HostOverviewActionPanel
          title="Experiences"
          subtitle="Curated sessions, workshops, and heritage walks across Mysuru and beyond."
          emptyMessage=""
          ctaLabel="Browse experiences →"
          ctaTo="/experiences"
          icon="compass"
          isEmpty={false}
        >
          <p className="host-overview-action__subtitle !mt-0">
            Book on behalf of your customer with optional markup and separate client confirmation emails.
          </p>
        </HostOverviewActionPanel>

        <HostOverviewActionPanel
          title="Homestays"
          subtitle="Heritage havelis, villas, and boutique stays for your travellers."
          emptyMessage=""
          ctaLabel="Browse homestays →"
          ctaTo="/homestays/browse"
          icon="building"
          isEmpty={false}
        >
          <p className="host-overview-action__subtitle !mt-0">
            Reserve stays with customer contact details and flexible email pricing options.
          </p>
        </HostOverviewActionPanel>
      </div>
    </TravelAgentDashboardShell>
  );
}
