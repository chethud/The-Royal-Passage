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
        <p className="luxury-panel-body text-sm">No experiences awaiting review.</p>
        <Link
          to="/experiences"
          className="luxury-panel-link mt-3 inline-block text-sm font-medium hover:underline"
        >
          Browse live catalog →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[rgb(88_16_0/0.12)]">
      {rows.map((row) => (
        <li key={row.id} className="py-4 first:pt-0 last:pb-0">
          <AdminExperienceApprovalRow row={row} />
        </li>
      ))}
    </ul>
  );
}
