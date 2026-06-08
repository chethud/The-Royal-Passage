import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import {
  approveExperience,
  listPendingExperiences,
  rejectExperienceFn,
  type AdminExperienceSummary,
} from "@/lib/admin-fns";
import { formatDateLong } from "@/lib/date-format";

type AdminExperienceQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

export function AdminExperienceQueue({ accessToken, refreshKey = 0 }: AdminExperienceQueueProps) {
  const [rows, setRows] = useState<AdminExperienceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPendingExperiences({ data: { accessToken } });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pending experiences.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const runAction = async (
    experienceId: string,
    action: (input: {
      data: { accessToken: string; experienceId: string };
    }) => Promise<AdminExperienceSummary>,
  ) => {
    setBusyId(experienceId);
    setError(null);
    try {
      await action({ data: { accessToken, experienceId } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const btn =
    "rounded-sm border px-2 py-1 text-xs disabled:opacity-50 hover:border-ember/50";

  return (
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
      <h2 className="font-display text-2xl">Experience approvals</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Publish host-submitted experiences after review.
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
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)] px-4 py-3"
            >
              <div>
                <div className="font-display text-lg">{row.title}</div>
                <div className="text-sm text-muted-foreground">
                  {row.hostName} · {row.city} · {formatDateLong(row.createdAt.slice(0, 10))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExperienceStatusBadge status={row.status} />
                <button
                  type="button"
                  disabled={busyId === row.id}
                  className={btn}
                  onClick={() => void runAction(row.id, approveExperience)}
                >
                  Publish
                </button>
                <button
                  type="button"
                  disabled={busyId === row.id}
                  className={`${btn} border-destructive/40 text-destructive`}
                  onClick={() => void runAction(row.id, rejectExperienceFn)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
