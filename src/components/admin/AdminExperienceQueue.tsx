import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminExperienceApprovalRow } from "@/components/admin/AdminExperienceApprovalRow";
import { fetchAdminExperienceApprovals, type AdminExperienceSummary } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type AdminExperienceQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

export function AdminExperienceQueue({ accessToken, refreshKey = 0 }: AdminExperienceQueueProps) {
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
      const data = await fetchAdminExperienceApprovals(accessToken);
      setRows(data.filter((row) => row.status === "pending_review"));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load experience approvals."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading submissions…</p>
      ) : error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">No experiences awaiting review.</p>
          <Link to="/experiences" className="mt-3 inline-block text-sm text-ember hover:underline">
            Browse live catalog →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <AdminExperienceApprovalRow row={row} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
