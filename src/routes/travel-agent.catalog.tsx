import { createFileRoute, Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
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
      <div className="grid gap-4 md:grid-cols-2">
        <LuxuryCheckoutPanel>
          <h2 className="font-display text-xl luxury-panel-heading">Experiences</h2>
          <p className="mt-2 text-sm luxury-panel-body">
            Browse curated experiences and book on behalf of your customer with optional markup.
          </p>
          <Link to="/experiences" className="luxury-btn-sm mt-4 inline-flex no-underline">
            Browse experiences →
          </Link>
        </LuxuryCheckoutPanel>
        <LuxuryCheckoutPanel>
          <h2 className="font-display text-xl luxury-panel-heading">Homestays</h2>
          <p className="mt-2 text-sm luxury-panel-body">
            Reserve homestays for clients with customer contact details and email preferences.
          </p>
          <Link to="/homestays/browse" className="luxury-btn-sm mt-4 inline-flex no-underline">
            Browse homestays →
          </Link>
        </LuxuryCheckoutPanel>
      </div>
    </TravelAgentDashboardShell>
  );
}
