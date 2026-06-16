import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import {
  fetchAdminHomestay,
  publishHomestay,
  rejectHomestay,
  type AdminHomestayDetail,
} from "@/lib/api/admin-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { formatMoney } from "@/lib/money";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/homestays/$homestayId")({
  head: () => ({
    meta: [{ title: "Review homestay — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AdminHomestayDetailPage,
});

function AdminHomestayDetailPage() {
  const { homestayId } = Route.useParams();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [homestay, setHomestay] = useState<AdminHomestayDetail | null>(null);
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

  const loadHomestay = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setHomestay(await fetchAdminHomestay(accessToken, homestayId));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load homestay for review."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, homestayId]);

  useEffect(() => {
    if (!accessToken) return;
    void loadHomestay();
  }, [accessToken, loadHomestay]);

  const runAction = async (action: "publish" | "reject") => {
    if (!accessToken) return;
    const ok = window.confirm(
      action === "publish"
        ? "Approve and publish this homestay to the live catalog?"
        : "Reject this submission?",
    );
    if (!ok) return;

    setBusy(true);
    setPageError(null);
    try {
      if (action === "publish") {
        await publishHomestay(accessToken, homestayId);
        await loadHomestay();
      } else {
        await rejectHomestay(accessToken, homestayId);
        void navigate({ to: "/admin/homestays" });
      }
    } catch (err) {
      setPageError(toErrorMessage(err, "Action failed."));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || role !== "admin" || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  const isPending = homestay?.status === "pending_review";
  const canPublish = isPending && (homestay?.rooms.length ?? 0) > 0;

  return (
    <DashboardShell
      role="admin"
      title={homestay?.title ?? "Review homestay"}
      subtitle="Review property details, rooms, and owner info before publishing."
      showRoleDescription={false}
    >
      <div className="mb-6">
        <Link to="/admin/homestays" className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline">
          ← Back to pending list
        </Link>
      </div>

      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading submission…</p>
        </LuxuryCheckoutPanel>
      ) : pageError && !homestay ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : homestay ? (
        <div className="space-y-8">
          <LuxuryCheckoutPanel>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <ExperienceStatusBadge status={homestay.status} surface="light" />
              {homestay.status === "published" ? (
                <Link
                  to="/homestays/$slug"
                  params={{ slug: homestay.slug }}
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
            <p className="luxury-panel-body text-sm">{homestay.description}</p>
            <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <dt className="luxury-panel-label text-xs uppercase">City</dt>
                <dd>{homestay.city}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">From / night</dt>
                <dd>{formatMoney(homestay.pricePerNightMinor, homestay.currencySymbol)}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Owner</dt>
                <dd>{homestay.ownerName}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Rooms</dt>
                <dd>{homestay.rooms.length}</dd>
              </div>
            </dl>
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
                  <p className="luxury-panel-body w-full text-xs">Requires at least one active room.</p>
                ) : null}
              </div>
            ) : null}
          </LuxuryCheckoutPanel>
        </div>
      ) : null}
    </DashboardShell>
  );
}
