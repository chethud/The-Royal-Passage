import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminExperienceReview } from "@/components/admin/AdminExperienceReview";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import {
  fetchAdminExperience,
  publishExperience,
  rejectExperience,
  type AdminExperienceDetail,
} from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/experiences/$experienceId")({
  head: () => ({
    meta: [{ title: "Review experience — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AdminExperienceReviewPage,
});

function AdminExperienceReviewPage() {
  const { experienceId } = Route.useParams();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [experience, setExperience] = useState<AdminExperienceDetail | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

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

  const loadExperience = useCallback(async (silent = false) => {
    if (!accessToken) return;
    if (!silent) setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const detail = await fetchAdminExperience(accessToken, experienceId);
      setExperience(detail);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load experience for review."));
    } finally {
      if (!silent) setPageLoading(false);
    }
  }, [accessToken, experienceId]);

  useEffect(() => {
    if (!accessToken) return;
    void loadExperience();
  }, [accessToken, loadExperience]);

  const runAction = async (action: "publish" | "reject") => {
    if (!accessToken) return;
    if (action === "publish") {
      const ok = window.confirm(
        "Approve and publish this experience to the live site? Guests will be able to browse and book it.",
      );
      if (!ok) return;
    } else {
      const ok = window.confirm("Reject this submission? It will not appear on the live site.");
      if (!ok) return;
    }

    setBusy(true);
    setPageError(null);
    setJustPublished(false);
    try {
      if (action === "publish") {
        await publishExperience(accessToken, experienceId);
        await loadExperience(true);
        setJustPublished(true);
      } else {
        await rejectExperience(accessToken, experienceId);
        void navigate({ to: "/admin/experiences" });
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

  const isPending = experience?.status === "pending_review";
  const isPublished = experience?.status === "published";
  const canPublish = isPending && (experience?.slots.length ?? 0) > 0;

  return (
    <DashboardShell
      role="admin"
      title={experience?.title ?? "Review experience"}
      subtitle="Check every detail below — photos, host info, description, and slots — then approve to go live."
      showRoleDescription={false}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/experiences"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          ← Back to pending list
        </Link>
        {isPublished && experience.slug ? (
          <Link
            to="/experiences/$slug"
            params={{ slug: experience.slug }}
            className="dashboard-chrome-link"
          >
            View live listing →
          </Link>
        ) : null}
      </div>

      {justPublished && isPublished && experience?.slug ? (
        <LuxuryCheckoutPanel className="mb-6">
          <p className="luxury-panel-heading font-display text-lg">Approved and live on the marketplace</p>
          <p className="luxury-panel-body mt-1 text-sm">
            Guests can now browse and book this experience on the public site.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/experiences/$slug"
              params={{ slug: experience.slug }}
              className="luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
            >
              Open live page
            </Link>
            <Link
              to="/admin/experiences"
              className="luxury-btn-sm luxury-btn-panel-outline inline-flex items-center no-underline"
            >
              Back to pending list
            </Link>
          </div>
        </LuxuryCheckoutPanel>
      ) : null}

      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading full experience details…</p>
        </LuxuryCheckoutPanel>
      ) : pageError && !experience ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : experience ? (
        <div className="space-y-6">
          {pageError ? (
            <LuxuryCheckoutPanel>
              <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {pageError}
              </p>
            </LuxuryCheckoutPanel>
          ) : null}

          {isPending ? (
            <LuxuryCheckoutPanel className="sticky top-[calc(var(--header-height)+0.75rem)] z-20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="luxury-panel-body text-sm">
                  Review all sections, then approve to publish for guest bookings.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || !canPublish}
                    title={!canPublish ? "Host must add at least one bookable slot" : undefined}
                    className="luxury-btn-sm luxury-btn-primary disabled:opacity-50"
                    onClick={() => void runAction("publish")}
                  >
                    Approve & publish live
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="luxury-btn-sm luxury-btn-panel-danger disabled:opacity-50"
                    onClick={() => void runAction("reject")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </LuxuryCheckoutPanel>
          ) : null}

          <AdminExperienceReview experience={experience} />

          {isPending ? (
            <LuxuryCheckoutPanel>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy || !canPublish}
                  className="luxury-btn-sm luxury-btn-primary disabled:opacity-50"
                  onClick={() => void runAction("publish")}
                >
                  Approve & publish live
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="luxury-btn-sm luxury-btn-panel-danger disabled:opacity-50"
                  onClick={() => void runAction("reject")}
                >
                  Reject submission
                </button>
              </div>
              {!canPublish ? (
                <p className="luxury-panel-body mt-3 w-full text-xs">
                  Add at least one bookable slot before this experience can go live.
                </p>
              ) : null}
            </LuxuryCheckoutPanel>
          ) : isPublished ? (
            <LuxuryCheckoutPanel>
              <p className="luxury-panel-body text-sm">
                This experience is approved and live. Guests can book it on the public site.
              </p>
              {experience.slug ? (
                <Link
                  to="/experiences/$slug"
                  params={{ slug: experience.slug }}
                  className="luxury-btn-sm luxury-btn-panel-outline mt-4 inline-flex items-center no-underline"
                >
                  View live listing →
                </Link>
              ) : null}
            </LuxuryCheckoutPanel>
          ) : null}
        </div>
      ) : null}
    </DashboardShell>
  );
}
