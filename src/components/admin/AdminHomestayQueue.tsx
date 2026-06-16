import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { fetchAdminHomestayApprovals, type AdminHomestaySummary } from "@/lib/api/admin-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type AdminHomestayQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

export function AdminHomestayQueue({ accessToken, refreshKey = 0 }: AdminHomestayQueueProps) {
  const [rows, setRows] = useState<AdminHomestaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const data = await fetchAdminHomestayApprovals(accessToken);
      setRows(data.filter((row) => row.status === "pending_review"));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load homestay approvals."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return <p className="luxury-panel-body py-8 text-sm">Loading submissions…</p>;
  }

  if (error) {
    return (
      <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="luxury-panel-body text-sm">No homestays awaiting review.</p>
        <Link to="/homestays" className="luxury-panel-link mt-3 inline-block text-sm font-medium hover:underline">
          Browse live catalog →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
          <div>
            <p className="luxury-panel-heading font-display text-lg">{row.title}</p>
            <p className="luxury-panel-body text-sm">
              {row.city} · {row.ownerName}
            </p>
          </div>
          <Link
            to="/admin/homestays/$homestayId"
            params={{ homestayId: row.id }}
            className="luxury-btn-sm luxury-btn-primary inline-flex no-underline"
          >
            Review
          </Link>
        </li>
      ))}
    </ul>
  );
}
