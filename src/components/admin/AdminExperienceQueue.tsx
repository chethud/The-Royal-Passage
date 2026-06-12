import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { fetchPendingExperiences, type AdminExperienceSummary } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatDateLong } from "@/lib/date-format";

type AdminExperienceQueueProps = {
  accessToken: string;
  refreshKey?: number;
  onQueueChange?: () => void;
};

export function AdminExperienceQueue({
  accessToken,
  refreshKey = 0,
}: AdminExperienceQueueProps) {
  const [rows, setRows] = useState<AdminExperienceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const data = await fetchPendingExperiences(accessToken);
      setRows(data);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load pending experiences."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const reviewBtn =
    "inline-flex items-center rounded-sm border border-ember/55 bg-ember/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ember transition-colors hover:bg-ember/20";

  return (
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
      <h2 className="font-display text-2xl">Experience approvals</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Click <strong className="font-medium text-ink">Review</strong> to open the full submission on a
        separate page, then publish or reject from there.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading queue…</p>
      ) : error ? (
        <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No experiences awaiting review.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)] px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg">{row.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {row.hostName} · {row.city} · {formatDateLong(row.createdAt.slice(0, 10))}
                </div>
                {row.slug ? (
                  <div className="mt-1 text-xs text-muted-foreground/80">Slug: {row.slug}</div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExperienceStatusBadge status={row.status} />
                <Link
                  to="/admin/experiences/$experienceId"
                  params={{ experienceId: row.id }}
                  className={reviewBtn}
                >
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
