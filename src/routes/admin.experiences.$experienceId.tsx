import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminExperienceReview } from "@/components/admin/AdminExperienceReview";
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

  const btn =
    "rounded-sm border px-4 py-2 text-sm disabled:opacity-50 hover:border-ember/50";

  if (loading || !user || role !== "admin" || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  const isPending = experience?.status === "pending_review";
  const isPublished = experience?.status === "published";
  const canPublish = isPending && (experience?.slots.length ?? 0) > 0;

  return (
    <DashboardShell
      role="admin"
      title={experience?.title ?? "Review experience"}
      subtitle="Check every detail below — photos, host info, description, and slots — then approve to go live."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/experiences" className="text-sm text-ember hover:underline">
          ← Back to pending list
        </Link>
        {isPublished && experience.slug ? (
          <Link
            to="/experiences/$slug"
            params={{ slug: experience.slug }}
            className="text-sm font-medium text-ember hover:underline"
          >
            View live listing →
          </Link>
        ) : null}
      </div>

      {justPublished && isPublished && experience?.slug ? (
        <div className="mb-6 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
          <p className="font-display text-lg text-emerald-200">Approved and live on the marketplace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Guests can now browse and book this experience on the public site.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/experiences/$slug"
              params={{ slug: experience.slug }}
              className={`${btn} border-ember/50 bg-ember/10 text-ember`}
            >
              Open live page
            </Link>
            <Link to="/admin/experiences" className={`${btn} border-[oklch(0.88_0.08_86_/_0.35)]`}>
              Back to pending list
            </Link>
          </div>
        </div>
      ) : null}

      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading full experience details…</p>
      ) : pageError && !experience ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : experience ? (
        <div className="space-y-6">
          {pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : null}

          {isPending ? (
            <div className="sticky top-[calc(var(--header-height)+0.75rem)] z-20 flex flex-wrap items-center justify-between gap-3 rounded-md border border-ember/30 bg-[oklch(0.14_0.06_22_/_0.95)] px-4 py-3 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                Review all sections, then approve to publish for guest bookings.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !canPublish}
                  title={!canPublish ? "Host must add at least one bookable slot" : undefined}
                  className={`${btn} bg-ember text-primary-foreground border-ember/70`}
                  onClick={() => void runAction("publish")}
                >
                  Approve & publish live
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className={`${btn} border-destructive/40 text-destructive`}
                  onClick={() => void runAction("reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ) : null}

          <AdminExperienceReview experience={experience} />

          {isPending ? (
            <div className="flex flex-wrap gap-3 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-6">
              <button
                type="button"
                disabled={busy || !canPublish}
                className={`${btn} bg-ember text-primary-foreground border-ember/70`}
                onClick={() => void runAction("publish")}
              >
                Approve & publish live
              </button>
              <button
                type="button"
                disabled={busy}
                className={`${btn} border-destructive/40 text-destructive`}
                onClick={() => void runAction("reject")}
              >
                Reject submission
              </button>
              {!canPublish ? (
                <p className="w-full text-xs text-amber-200/80">
                  Add at least one bookable slot before this experience can go live.
                </p>
              ) : null}
            </div>
          ) : isPublished ? (
            <div className="space-y-3 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-6">
              <p className="text-sm text-emerald-300/90">
                This experience is approved and live. Guests can book it on the public site.
              </p>
              {experience.slug ? (
                <Link
                  to="/experiences/$slug"
                  params={{ slug: experience.slug }}
                  className={`${btn} inline-flex border-ember/50 text-ember`}
                >
                  View live listing →
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardShell>
  );
}
