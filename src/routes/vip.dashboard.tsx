import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import {
  fetchVipCustomPackageRequests,
  fetchVipMembershipApplications,
} from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/dashboard")({
  head: () => ({
    meta: [{ title: "VIP host overview — The Royal Passage" }],
  }),
  component: VipOwnerOverviewPage,
});

function VipOwnerOverviewPage() {
  const { ready, loading, accessToken } = useVipOwnerAccess();
  const [pendingMembers, setPendingMembers] = useState(0);
  const [openCustom, setOpenCustom] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!accessToken) return;
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [members, custom] = await Promise.all([
        fetchVipMembershipApplications(accessToken),
        fetchVipCustomPackageRequests(accessToken),
      ]);
      setPendingMembers(members.length);
      setOpenCustom(custom.length);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load VIP host summary."));
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadSummary();
  }, [accessToken, loadSummary]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="VIP host control"
      subtitle="Manage membership applications, custom package requests, and the shared package catalog."
      showRoleDescription={false}
    >
      {pageError ? (
        <p className="mb-5 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Pending memberships", value: String(pendingMembers) },
          { label: "Custom requests", value: String(openCustom) },
          { label: "Shared catalog", value: "All hosts" },
        ].map((stat) => (
          <LuxuryCheckoutPanel key={stat.label}>
            <p className="eyebrow luxury-panel-label">{stat.label}</p>
            <p className="mt-2 font-display text-4xl text-[#8B6914]">{stat.value}</p>
          </LuxuryCheckoutPanel>
        ))}
      </div>

      <LuxuryCheckoutPanel className="mt-8">
        <div className="flex items-start gap-3">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
          <div>
            <h2 className="luxury-panel-heading font-display text-xl">Quick links</h2>
            <p className="luxury-panel-body mt-2 text-sm">
              Every VIP host account sees the same membership queue, custom requests, and packages.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/vip/members"
                className="luxury-btn-sm luxury-btn-primary inline-flex no-underline"
              >
                Review memberships
              </Link>
              <Link
                to="/vip/custom-requests"
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
              >
                Custom requests
              </Link>
              <Link
                to="/vip/listings/new"
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
              >
                Add package
              </Link>
            </div>
          </div>
        </div>
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
