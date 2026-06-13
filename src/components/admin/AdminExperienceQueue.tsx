import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AdminExperienceApprovalRow,
  partitionExperienceApprovals,
} from "@/components/admin/AdminExperienceApprovalRow";
import { fetchAdminExperienceApprovals, type AdminExperienceSummary } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type AdminExperienceQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

function ExperienceSection({
  title,
  description,
  rows,
  emptyMessage,
  reviewLabel,
}: {
  title: string;
  description: string;
  rows: AdminExperienceSummary[];
  emptyMessage: string;
  reviewLabel?: string;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-xl">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <AdminExperienceApprovalRow key={row.id} row={row} reviewLabel={reviewLabel} />
          ))}
        </ul>
      )}
    </section>
  );
}

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
      setRows(data);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load experience approvals."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const { pending, approved } = partitionExperienceApprovals(rows);

  return (
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
      <h2 className="font-display text-2xl">Experience approvals</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Click <strong className="font-medium text-ink">Review</strong> to open the full host submission
        — photos, description, slots, and host details — then publish or reject from that page.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading approvals…</p>
      ) : error ? (
        <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No pending or approved experiences yet. Host submissions will appear here.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          <ExperienceSection
            title="Awaiting review"
            description="Host submissions waiting for your decision."
            rows={pending}
            emptyMessage="No experiences awaiting review."
          />
          <ExperienceSection
            title="Approved & live"
            description="Experiences you have published to the marketplace."
            rows={approved}
            emptyMessage="No approved experiences yet."
            reviewLabel="View details"
          />
        </div>
      )}
    </section>
  );
}

type AdminExperienceApprovalsPreviewProps = {
  accessToken: string;
  refreshKey?: number;
};

/** Compact pending list for the admin overview — each row links to the full review page. */
export function AdminExperienceApprovalsPreview({
  accessToken,
  refreshKey = 0,
}: AdminExperienceApprovalsPreviewProps) {
  const [pending, setPending] = useState<AdminExperienceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }

    void fetchAdminExperienceApprovals(accessToken)
      .then((rows) => setPending(rows.filter((row) => row.status === "pending_review")))
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  }, [accessToken, refreshKey]);

  if (loading) {
    return <p className="mt-4 text-sm text-muted-foreground">Loading submissions…</p>;
  }

  if (pending.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        No experiences awaiting review.{" "}
        <Link to="/admin/experiences" className="text-ember hover:underline">
          View approved experiences
        </Link>
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {pending.map((row) => (
        <AdminExperienceApprovalRow key={row.id} row={row} />
      ))}
    </ul>
  );
}
