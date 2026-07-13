import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import {
  deleteAdminSiteBanner,
  fetchAdminSiteBanners,
  upsertAdminSiteBanner,
  type SiteBanner,
} from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { uploadExperiencePhoto } from "@/lib/experience-photo-upload";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/banners/")({
  head: () => ({
    meta: [
      { title: "Banner Scheduler — The Royal Passage" },
      {
        name: "description",
        content: "Schedule festival banners, offers, and event promotions.",
      },
      ...NOINDEX_META,
    ],
  }),
  component: AdminBannersPage,
});

function defaultWindow() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  return {
    startsAt: start.toISOString().slice(0, 16),
    endsAt: end.toISOString().slice(0, 16),
  };
}

function AdminBannersPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const windowDefaults = defaultWindow();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [href, setHref] = useState("/experiences");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState(windowDefaults.startsAt);
  const [endsAt, setEndsAt] = useState(windowDefaults.endsAt);

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
      const payload = await fetchAdminSiteBanners(accessToken);
      setBanners(payload.banners ?? []);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load banners."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void load();
  }, [accessToken, load]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setPageError(null);
    try {
      const url = await uploadExperiencePhoto(file);
      setImageUrl(url);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to upload banner photo."));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!accessToken || !title.trim()) return;
    setSaving(true);
    setPageError(null);
    try {
      await upsertAdminSiteBanner(accessToken, {
        title: title.trim(),
        body: body.trim() || null,
        href: href.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        placement: "home_top",
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        active: true,
      });
      setTitle("");
      setBody("");
      setImageUrl(null);
      await load();
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to schedule banner."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!accessToken) return;
    try {
      await deleteAdminSiteBanner(accessToken, bannerId);
      await load();
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to delete banner."));
    }
  };

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Banner Scheduler"
      subtitle="Schedule festival banners, offers, and events. Active windows appear automatically on the homepage."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link
          to="/admin"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          ← Overview
        </Link>
        <Link
          to="/admin/homepage-edit"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          Homepage CMS
        </Link>
      </div>

      <div className="space-y-6">
        <LuxuryCheckoutPanel>
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Schedule banner</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs">
              <span className="luxury-panel-label">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.18)] bg-white/70 px-3 py-2 text-sm"
                placeholder="Dasara festival offer"
              />
            </label>
            <label className="block text-xs">
              <span className="luxury-panel-label">Link</span>
              <input
                value={href}
                onChange={(event) => setHref(event.target.value)}
                className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.18)] bg-white/70 px-3 py-2 text-sm"
                placeholder="/experiences"
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="luxury-panel-label">Body</span>
              <input
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.18)] bg-white/70 px-3 py-2 text-sm"
                placeholder="Limited weekend walks and palace evenings"
              />
            </label>
            <div className="sm:col-span-2">
              <span className="luxury-panel-label text-xs">Banner photo</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Banner preview"
                    className="h-20 w-32 rounded-sm object-cover border border-[rgb(74_0_0/0.18)]"
                  />
                ) : (
                  <div className="flex h-20 w-32 items-center justify-center rounded-sm border border-dashed border-[rgb(74_0_0/0.25)] bg-white/40 text-[0.65rem] text-[rgb(74_0_0/0.55)]">
                    No photo
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => void handlePhotoChange(event)}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="luxury-btn-sm dashboard-chrome-btn"
                  >
                    {uploading ? "Uploading…" : imageUrl ? "Replace photo" : "Upload photo"}
                  </button>
                  {imageUrl ? (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => setImageUrl(null)}
                      className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-destructive"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            <label className="block text-xs">
              <span className="luxury-panel-label">Starts</span>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.18)] bg-white/70 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="luxury-panel-label">Ends</span>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.18)] bg-white/70 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={saving || uploading || !title.trim()}
            onClick={() => void handleCreate()}
            className="luxury-btn-sm luxury-btn-primary mt-4"
          >
            {saving ? "Saving…" : "Schedule banner"}
          </button>
          {pageError ? <p className="mt-3 text-sm text-destructive">{pageError}</p> : null}
        </LuxuryCheckoutPanel>

        <LuxuryCheckoutPanel>
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Scheduled banners</h2>
          {pageLoading ? (
            <p className="luxury-panel-body mt-4 py-6 text-sm">Loading…</p>
          ) : banners.length === 0 ? (
            <p className="luxury-panel-body mt-4 py-6 text-sm">No banners scheduled yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[rgb(74_0_0/0.12)]">
              {banners.map((banner) => (
                <li key={banner.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-sm object-cover border border-[rgb(74_0_0/0.15)]"
                      />
                    ) : null}
                    <div>
                      <div className="luxury-panel-heading font-medium">{banner.title}</div>
                      <p className="luxury-panel-body mt-1 text-xs">
                        {banner.body || "No body"} · {banner.active ? "Active window" : "Inactive"}
                      </p>
                      <p className="luxury-panel-body mt-1 text-[0.65rem]">
                        {new Date(banner.startsAt).toLocaleString()} →{" "}
                        {new Date(banner.endsAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(banner.id)}
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-destructive"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </LuxuryCheckoutPanel>
      </div>
    </DashboardShell>
  );
}
