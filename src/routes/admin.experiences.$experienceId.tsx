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

  const loadExperience = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
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
      setPageLoading(false);
    }
  }, [accessToken, experienceId]);

  useEffect(() => {
    if (!accessToken) return;
    void loadExperience();
  }, [accessToken, loadExperience]);

  const runAction = async (action: "publish" | "reject") => {
    if (!accessToken) return;
    setBusy(true);
    setPageError(null);
    try {
      if (action === "publish") {
        await publishExperience(accessToken, experienceId);
      } else {
        await rejectExperience(accessToken, experienceId);
      }
      void navigate({ to: "/admin/experiences" });
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

  return (
    <DashboardShell
      role="admin"
      title="Review experience"
      subtitle="Review the full host submission before publishing to the marketplace."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link to="/admin/experiences" className="text-sm text-ember hover:underline">
          ← Back to approvals
        </Link>
      </div>

      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading experience details…</p>
      ) : pageError && !experience ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : experience ? (
        <div className="space-y-8">
          {pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : null}

          <AdminExperienceReview experience={experience} />

          {experience.status === "pending_review" ? (
            <div className="flex flex-wrap gap-3 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-6">
              <button
                type="button"
                disabled={busy}
                className={`${btn} bg-ember text-primary-foreground border-ember/70`}
                onClick={() => void runAction("publish")}
              >
                Approve & publish
              </button>
              <button
                type="button"
                disabled={busy}
                className={`${btn} border-destructive/40 text-destructive`}
                onClick={() => void runAction("reject")}
              >
                Reject submission
              </button>
            </div>
          ) : experience.status === "published" ? (
            <div className="space-y-4 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-6">
              <p className="text-sm text-emerald-300/90">
                This experience is approved and live on the marketplace.
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
