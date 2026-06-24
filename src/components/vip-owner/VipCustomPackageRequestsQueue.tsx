import { useCallback, useEffect, useState } from "react";
import {
  fetchVipCustomPackageRequests,
  type VipCustomPackageRequestSummary,
} from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type VipCustomPackageRequestsQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

export function VipCustomPackageRequestsQueue({
  accessToken,
  refreshKey = 0,
}: VipCustomPackageRequestsQueueProps) {
  const [rows, setRows] = useState<VipCustomPackageRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setRows(await fetchVipCustomPackageRequests(accessToken));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load custom package requests."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return <p className="luxury-panel-body py-8 text-sm">Loading requests…</p>;
  }

  if (error) {
    return (
      <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="luxury-panel-body py-8 text-sm">No open custom package requests.</p>;
  }

  return (
    <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
      {rows.map((row) => (
        <li key={row.id} className="py-4 first:pt-0 last:pb-0">
          <p className="luxury-panel-heading font-display text-lg">{row.guestName}</p>
          <p className="luxury-panel-body text-sm">
            {row.guestEmail}
            {row.guestPhone ? ` · ${row.guestPhone}` : ""}
          </p>
          <p className="luxury-panel-body mt-1 text-sm">
            {row.travelStart} → {row.travelEnd} · {row.guestCount} guest
            {row.guestCount === 1 ? "" : "s"}
          </p>
          {row.preferences ? (
            <p className="luxury-panel-body mt-2 text-sm text-muted-foreground">{row.preferences}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
