import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import {
  fetchAdminVipPackage,
  publishVipPackage,
  rejectVipPackage,
  type AdminVipPackageDetail,
} from "@/lib/api/admin-vip-packages";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { formatMoney } from "@/lib/money";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/vip-packages/$packageId")({
  head: () => ({
    meta: [{ title: "Review VIP package — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AdminVipPackageDetailPage,
});

function AdminVipPackageDetailPage() {
  const { packageId } = Route.useParams();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pkg, setPkg] = useState<AdminVipPackageDetail | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(false);

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

  const loadPackage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setPkg(await fetchAdminVipPackage(accessToken, packageId));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load package for review."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, packageId]);

  useEffect(() => {
    if (!accessToken) return;
    void loadPackage();
  }, [accessToken, loadPackage]);

  const runAction = async (action: "publish" | "reject") => {
    if (!accessToken) return;
    const ok = window.confirm(
      action === "publish"
        ? "Approve and publish this package to the live catalog?"
        : "Reject this submission?",
    );
    if (!ok) return;

    setBusy(true);
    setPageError(null);
    try {
      if (action === "publish") {
        await publishVipPackage(accessToken, packageId);
        await loadPackage();
      } else {
        await rejectVipPackage(accessToken, packageId);
        void navigate({ to: "/admin/vip-packages" });
      }
    } catch (err) {
      setPageError(toErrorMessage(err, "Action failed."));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  const isPending = pkg?.status === "pending_review";
  const canPublish = isPending && Boolean(pkg?.description?.trim()) && (pkg?.priceFromMinor ?? 0) > 0;

  return (
    <DashboardShell
      role="admin"
      title={pkg?.title ?? "Review VIP package"}
      subtitle="Review package details and owner info before publishing."
      showRoleDescription={false}
    >
      <div className="mb-6">
        <Link to="/admin/vip-packages" className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline">
          ← Back to pending list
        </Link>
      </div>

      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading submission…</p>
        </LuxuryCheckoutPanel>
      ) : pageError && !pkg ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : pkg ? (
        <div className="space-y-8">
          <LuxuryCheckoutPanel>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <ExperienceStatusBadge status={pkg.status} surface="light" />
              {pkg.status === "published" ? (
                <Link
                  to="/vips/$slug"
                  params={{ slug: pkg.slug }}
                  className="luxury-panel-link text-sm hover:underline"
                >
                  View live listing →
                </Link>
              ) : null}
            </div>
            {pageError ? (
              <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {pageError}
              </p>
            ) : null}
            {pkg.tagline ? <p className="luxury-panel-body text-sm italic">{pkg.tagline}</p> : null}
            <p className="luxury-panel-body mt-3 text-sm">{pkg.description}</p>
            {pkg.highlights.length > 0 ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm luxury-panel-body">
                {pkg.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Package type</dt>
                <dd>{pkg.packageType}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">City</dt>
                <dd>{pkg.city}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Duration</dt>
                <dd>
                  {pkg.durationDays} day{pkg.durationDays === 1 ? "" : "s"}
                </dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">From price</dt>
                <dd>{formatMoney(pkg.priceFromMinor, pkg.currencySymbol)}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Max guests</dt>
                <dd>{pkg.maxGuests}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Owner</dt>
                <dd>{pkg.ownerName}</dd>
              </div>
            </dl>
            {pkg.conciergeNote ? (
              <p className="luxury-panel-body mt-6 text-sm">
                <span className="luxury-panel-label text-xs uppercase">Concierge note: </span>
                {pkg.conciergeNote}
              </p>
            ) : null}
            {isPending ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="luxury-btn luxury-btn-primary"
                  disabled={busy || !canPublish}
                  onClick={() => void runAction("publish")}
                >
                  Publish to catalog
                </button>
                <button
                  type="button"
                  className="luxury-btn luxury-btn-panel-outline"
                  disabled={busy}
                  onClick={() => void runAction("reject")}
                >
                  Reject
                </button>
                {!canPublish ? (
                  <p className="luxury-panel-body w-full text-xs">
                    Requires a description and starting price above zero.
                  </p>
                ) : null}
              </div>
            ) : null}
          </LuxuryCheckoutPanel>
        </div>
      ) : null}
    </DashboardShell>
  );
}
