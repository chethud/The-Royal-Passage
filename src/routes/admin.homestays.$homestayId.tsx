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
import { formatWeekdayWeekendRates } from "@/lib/homestay-day-pricing";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DetailList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <div>
      <h2 className="luxury-panel-label text-xs uppercase">{title}</h2>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm text-foreground/85">
          {items.map((item) => (
            <li key={item} className="rounded-sm border border-[rgb(74_0_0/0.08)] bg-[rgb(255_248_230/0.55)] px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="luxury-panel-body mt-3 text-sm">{emptyMessage}</p>
      )}
    </div>
  );
}

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
    return <PageLoadingGate />;
  }

  const isPending = homestay?.status === "pending_review";
  const canPublish = isPending && (homestay?.rooms.length ?? 0) > 0;
  const gallery = homestay
    ? [homestay.heroImageUrl, ...homestay.galleryUrls].filter(
        (url, index, urls): url is string => Boolean(url) && urls.indexOf(url) === index,
      )
    : [];

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
            {gallery.length ? (
              <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_248_230/0.4)]">
                  <img
                    src={gallery[0]}
                    alt={homestay.title}
                    className="h-[16rem] w-full object-cover sm:h-[20rem]"
                  />
                </div>
                {gallery.length > 1 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {gallery.slice(1, 5).map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="overflow-hidden rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_248_230/0.4)]"
                      >
                        <img src={url} alt={`${homestay.title} photo ${index + 2}`} className="h-32 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              {homestay.tagline ? (
                <p className="font-display text-lg italic text-[rgb(74_0_0/0.74)]">{homestay.tagline}</p>
              ) : null}
              <p className="luxury-panel-body text-sm leading-relaxed whitespace-pre-line">{homestay.description}</p>
            </div>

            <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt className="luxury-panel-label text-xs uppercase">City</dt>
                <dd>{homestay.city}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Region</dt>
                <dd>{homestay.region || "Not provided"}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Weekday / night</dt>
                <dd>{formatMoney(homestay.pricePerNightMinor, homestay.currencySymbol)}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Weekend / night</dt>
                <dd>
                  {formatMoney(
                    homestay.weekendPricePerNightMinor ?? homestay.pricePerNightMinor,
                    homestay.currencySymbol,
                  )}
                </dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Owner</dt>
                <dd>{homestay.ownerName}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Owner email</dt>
                <dd>{homestay.ownerEmail || "Not provided"}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Owner phone</dt>
                <dd>{homestay.ownerPhone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Rooms</dt>
                <dd>{homestay.rooms.length}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Property type</dt>
                <dd>{homestay.propertyType}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Bedrooms</dt>
                <dd>{homestay.bedrooms}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Bathrooms</dt>
                <dd>{homestay.bathrooms}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Max guests</dt>
                <dd>{homestay.maxGuests}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Check-in</dt>
                <dd>{homestay.checkInTime}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Check-out</dt>
                <dd>{homestay.checkOutTime}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Submitted</dt>
                <dd>{formatDateTime(homestay.createdAt)}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Last updated</dt>
                <dd>{formatDateTime(homestay.updatedAt)}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Address</dt>
                <dd>{homestay.address || "Not provided"}</dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Map link</dt>
                <dd>
                  {homestay.mapLink ? (
                    <a
                      href={homestay.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="luxury-panel-link hover:underline"
                    >
                      Open map
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
              <div>
                <dt className="luxury-panel-label text-xs uppercase">Certificate / license</dt>
                <dd>
                  {homestay.licenseCertificateUrl ? (
                    <a
                      href={homestay.licenseCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="luxury-panel-link hover:underline"
                    >
                      View uploaded document
                    </a>
                  ) : (
                    <span className="text-destructive">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <DetailList
                title="Amenities"
                items={homestay.amenities}
                emptyMessage="No amenities were included in the request."
              />
              <DetailList
                title="House rules"
                items={homestay.houseRules}
                emptyMessage="No house rules were included in the request."
              />
            </div>
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

          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-xl uppercase tracking-[0.03em]">
              Pricing and rooms
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-sm border border-[rgb(74_0_0/0.08)] bg-[rgb(255_248_230/0.55)] px-4 py-3">
                <div className="luxury-panel-label text-xs uppercase">Base weekday price</div>
                <div className="mt-1 font-display text-lg text-foreground">
                  {formatMoney(homestay.pricePerNightMinor, homestay.currencySymbol)}
                </div>
              </div>
              <div className="rounded-sm border border-[rgb(74_0_0/0.08)] bg-[rgb(255_248_230/0.55)] px-4 py-3">
                <div className="luxury-panel-label text-xs uppercase">Base weekend price</div>
                <div className="mt-1 font-display text-lg text-foreground">
                  {formatMoney(
                    homestay.weekendPricePerNightMinor ?? homestay.pricePerNightMinor,
                    homestay.currencySymbol,
                  )}
                </div>
              </div>
              <div className="rounded-sm border border-[rgb(74_0_0/0.08)] bg-[rgb(255_248_230/0.55)] px-4 py-3">
                <div className="luxury-panel-label text-xs uppercase">Extra bed</div>
                <div className="mt-1 font-display text-lg text-foreground">
                  {homestay.extraBedAvailable
                    ? formatWeekdayWeekendRates(
                        homestay.currencySymbol,
                        Math.round(homestay.extraBedPricePerNightMinor / 100),
                        Math.round(
                          (homestay.extraBedWeekendPricePerNightMinor ?? homestay.extraBedPricePerNightMinor) /
                            100,
                        ),
                      )
                    : homestay.rooms.some((room) => room.extraBedAvailable)
                      ? "Configured per room"
                      : "Not enabled"}
                </div>
              </div>
              <div className="rounded-sm border border-[rgb(74_0_0/0.08)] bg-[rgb(255_248_230/0.55)] px-4 py-3">
                <div className="luxury-panel-label text-xs uppercase">Owner verified</div>
                <div className="mt-1 font-display text-lg text-foreground">
                  {homestay.ownerVerified ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {homestay.rooms.length ? (
                homestay.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-sm border border-[rgb(74_0_0/0.1)] bg-[rgb(255_248_230/0.45)] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg uppercase tracking-[0.03em] text-foreground">
                          {room.name}
                        </h3>
                        <p className="luxury-panel-body mt-1 text-xs">
                          {room.category || "Standard room"} · Capacity {room.capacity} · Units {room.totalUnits}
                        </p>
                      </div>
                      <span className="luxury-panel-label rounded-full border border-[rgb(74_0_0/0.12)] px-2.5 py-1 text-[0.65rem] uppercase">
                        {room.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <div className="luxury-panel-label text-xs uppercase">Weekday / night</div>
                        <div>{formatMoney(room.pricePerNightMinor, homestay.currencySymbol)}</div>
                      </div>
                      <div>
                        <div className="luxury-panel-label text-xs uppercase">Weekend / night</div>
                        <div>
                          {formatMoney(
                            room.weekendPricePerNightMinor ?? room.pricePerNightMinor,
                            homestay.currencySymbol,
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="luxury-panel-label text-xs uppercase">Extra bed</div>
                        <div>
                          {room.extraBedAvailable
                            ? `${formatWeekdayWeekendRates(
                                homestay.currencySymbol,
                                Math.round(room.extraBedPricePerNightMinor / 100),
                                Math.round(
                                  (room.extraBedWeekendPricePerNightMinor ?? room.extraBedPricePerNightMinor) / 100,
                                ),
                              )} · up to ${room.extraBedsPerRoom}`
                            : "Not available"}
                        </div>
                      </div>
                      <div>
                        <div className="luxury-panel-label text-xs uppercase">Amenities</div>
                        <div>{room.amenities.length ? room.amenities.join(", ") : "None listed"}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="luxury-panel-body text-sm">No rooms were added to this submission yet.</p>
              )}
            </div>
          </LuxuryCheckoutPanel>
        </div>
      ) : null}
    </DashboardShell>
  );
}
