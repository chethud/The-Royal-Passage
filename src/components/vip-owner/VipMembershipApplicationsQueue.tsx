import { useCallback, useEffect, useState } from "react";
import {
  approveVipMembership,
  fetchVipMembershipApplications,
  rejectVipMembership,
  type VipMembershipApplicationSummary,
} from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type VipMembershipApplicationsQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

export function VipMembershipApplicationsQueue({
  accessToken,
  refreshKey = 0,
}: VipMembershipApplicationsQueueProps) {
  const [rows, setRows] = useState<VipMembershipApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setRows(await fetchVipMembershipApplications(accessToken));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load membership applications."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const runAction = async (applicationId: string, action: "approve" | "reject") => {
    const ok = window.confirm(
      action === "approve"
        ? "Approve this guest for VIP membership?"
        : "Reject this VIP membership application?",
    );
    if (!ok) return;

    setBusyId(applicationId);
    setError(null);
    try {
      if (action === "approve") {
        await approveVipMembership(accessToken, applicationId);
      } else {
        await rejectVipMembership(accessToken, applicationId);
      }
      await load();
    } catch (err) {
      setError(toErrorMessage(err, "Action failed."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="luxury-panel-body py-8 text-sm">Loading applications…</p>;
  }

  if (error) {
    return (
      <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="luxury-panel-body py-8 text-sm">No membership applications awaiting review.</p>;
  }

  return (
    <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
          <div>
            <p className="luxury-panel-heading font-display text-lg">{row.fullName}</p>
            <p className="luxury-panel-body text-sm">
              {row.email}
              {row.phone ? ` · ${row.phone}` : ""} · {formatIdType(row.idDocumentType)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="luxury-btn-sm luxury-btn-primary"
              disabled={busyId === row.id}
              onClick={() => void runAction(row.id, "approve")}
            >
              Approve
            </button>
            <button
              type="button"
              className="luxury-btn-sm luxury-btn-panel-outline"
              disabled={busyId === row.id}
              onClick={() => void runAction(row.id, "reject")}
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatIdType(value: string): string {
  if (value === "aadhaar") return "Aadhaar";
  if (value === "visitor_id") return "Visitor ID";
  if (value === "business_id") return "Business ID";
  return value;
}
