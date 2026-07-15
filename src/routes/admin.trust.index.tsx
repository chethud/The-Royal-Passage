import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const CATEGORY_COPY: Record<string, { label: string; blurb: string }> = {
  duplicate_accounts: {
    label: "Duplicate accounts",
    blurb: "Shared phones or repeated display names across profiles.",
  },
  review_spam: {
    label: "Review spam",
    blurb: "Identical review text or bursts of one-star reviews.",
  },
  suspicious_bookings: {
    label: "Suspicious bookings",
    blurb: "Repeated cancellations, stacked pending requests, or high-value unpaid bookings.",
  },
};

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

  const grouped = useMemo(() => {
    const order = ["duplicate_accounts", "review_spam", "suspicious_bookings"];
    const map = new Map<string, AdminRiskSignal[]>();
    for (const signal of signals) {
      const key = signal.category || "other";
      const list = map.get(key) ?? [];
      list.push(signal);
      map.set(key, list);
    }
    const known = order.filter((key) => map.has(key)).map((key) => [key, map.get(key)!] as const);
    const extra = [...map.entries()].filter(([key]) => !order.includes(key));
    return [...known, ...extra];
  }, [signals]);

  const highCount = signals.filter((signal) => signal.severity === "high").length;

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Fraud Center"
      subtitle="Live heuristic checks for duplicate accounts, review spam, and suspicious bookings."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          ← Overview
        </Link>
        <p className="text-sm text-muted-foreground">
          {signals.length} signal{signals.length === 1 ? "" : "s"}
          {highCount > 0 ? ` · ${highCount} high severity` : ""}
        </p>
      </div>

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
          <div className="space-y-8">
            {grouped.map(([category, rows]) => {
              const copy = CATEGORY_COPY[category] ?? {
                label: category.replaceAll("_", " "),
                blurb: "Flagged by trust heuristics.",
              };
              return (
                <section key={category}>
                  <div className="mb-4 border-b border-[rgb(74_0_0/0.12)] pb-3">
                    <h2 className="luxury-panel-heading font-display text-lg tracking-wide">
                      {copy.label}
                    </h2>
                    <p className="luxury-panel-body mt-1 text-sm">{copy.blurb}</p>
                    <p className="luxury-panel-body mt-1 text-xs opacity-75">
                      {rows.length} open flag{rows.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {rows.map((signal) => (
                      <li
                        key={signal.id}
                        className="rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="luxury-panel-heading font-medium">{signal.title}</h3>
                              <SeverityChip severity={signal.severity} />
                            </div>
                            <p className="luxury-panel-body mt-2 text-sm leading-relaxed">
                              {signal.detail}
                            </p>
                            {(signal.evidence?.length ?? 0) > 0 ? (
                              <ul className="luxury-panel-body mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                                {signal.evidence!.map((line) => (
                                  <li key={`${signal.id}-${line}`}>{line}</li>
                                ))}
                              </ul>
                            ) : null}
                            {signal.entityType || signal.entityId ? (
                              <p className="luxury-panel-body mt-3 text-[0.65rem] uppercase tracking-[0.12em] opacity-70">
                                {signal.entityType ? signal.entityType.replaceAll("_", " ") : "entity"}
                                {signal.entityId ? ` · ${signal.entityId}` : ""}
                              </p>
                            ) : null}
                          </div>
                          {signal.href ? (
                            <SignalReviewLink signal={signal} />
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}

function SignalReviewLink({ signal }: { signal: AdminRiskSignal }) {
  const href = signal.href;
  if (!href) return null;

  const search = signal.search ?? undefined;
  // Entity deep-link when we already have a booking id.
  if (signal.entityType === "booking" && signal.entityId && !search?.status && !search?.payment) {
    return (
      <Link
        to="/admin/bookings/$bookingId"
        params={{ bookingId: signal.entityId }}
        className="luxury-btn-sm luxury-btn-primary shrink-0 no-underline"
      >
        Open booking
      </Link>
    );
  }

  if (href === "/admin/bookings") {
    return (
      <Link
        to="/admin/bookings"
        search={search ?? undefined}
        className="luxury-btn-sm luxury-btn-primary shrink-0 no-underline"
      >
        Review bookings
      </Link>
    );
  }

  if (href === "/admin/reviews") {
    return (
      <Link to="/admin/reviews" className="luxury-btn-sm luxury-btn-primary shrink-0 no-underline">
        Review feedback
      </Link>
    );
  }

  if (href === "/admin/profile/users") {
    return (
      <Link
        to="/admin/profile/users"
        className="luxury-btn-sm luxury-btn-primary shrink-0 no-underline"
      >
        Review users
      </Link>
    );
  }

  return (
    <Link to={href} className="luxury-btn-sm luxury-btn-primary shrink-0 no-underline">
      Review
    </Link>
  );
}

function SeverityChip({ severity }: { severity: string }) {
  const tone =
    severity === "high"
      ? "border-destructive/45 bg-destructive/10 text-[#8B1A1A]"
      : severity === "medium"
        ? "border-[#8B6914]/40 bg-[#F5E6C0]/70 text-[#5C4508]"
        : "border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.4)] text-[#4A0000]";
  return (
    <span
      className={`rounded-sm border px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] ${tone}`}
    >
      {severity}
    </span>
  );
}
