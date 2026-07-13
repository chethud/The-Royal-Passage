import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminRiskSignals, type AdminRiskSignal } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/trust/")({
  head: () => ({
    meta: [
      { title: "Fraud Center — The Royal Passage" },
      {
        name: "description",
        content: "Flag duplicate accounts, review spam, and suspicious bookings.",
      },
      ...NOINDEX_META,
    ],
  }),
  component: AdminTrustPage,
});

function AdminTrustPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [signals, setSignals] = useState<AdminRiskSignal[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  useEffect(() => {
    if (!user) return;
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      });
  }, [user]);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setSignals(await fetchAdminRiskSignals(accessToken));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load risk signals."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [accessToken, load]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Fraud Center"
      subtitle="Heuristic flags for duplicate accounts, review spam, and suspicious bookings."
      showRoleDescription={false}
    >
      <Link
        to="/admin"
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex items-center no-underline"
      >
        ← Overview
      </Link>

      <LuxuryCheckoutPanel>
        {pageLoading && signals.length === 0 ? (
          <p className="luxury-panel-body py-8 text-sm">Scanning risk signals…</p>
        ) : pageError ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : signals.length === 0 ? (
          <p className="luxury-panel-body py-8 text-sm">No risk signals right now.</p>
        ) : (
          <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
            {signals.map((signal) => (
              <li key={signal.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="luxury-panel-heading font-medium">{signal.title}</span>
                      <SeverityChip severity={signal.severity} />
                      <span className="text-[0.58rem] uppercase tracking-[0.14em] text-[#9A7228]/80">
                        {signal.category.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="luxury-panel-body mt-1 text-xs">{signal.detail}</p>
                  </div>
                  {signal.href ? (
                    <Link
                      to={signal.href}
                      className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#9A7228] hover:underline"
                    >
                      Review
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}

function SeverityChip({ severity }: { severity: string }) {
  const tone =
    severity === "high"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.4)] text-[#4A0000]";
  return (
    <span className={`rounded-sm border px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {severity}
    </span>
  );
}
