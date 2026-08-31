import { useCallback, useEffect, useState } from "react";
import { formatDateLong } from "@/lib/date-format";
import { toErrorMessage } from "@/lib/api/client";
import {
  listPartnerTravelAgentApplications,
  reviewPartnerTravelAgentApplication,
  type PartnerTravelAgentApplication,
} from "@/lib/partner-travel-agent-fns";

type AdminPartnerTravelAgentApplicationsQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

export function AdminPartnerTravelAgentApplicationsQueue({
  accessToken,
  refreshKey = 0,
}: AdminPartnerTravelAgentApplicationsQueueProps) {
  const [rows, setRows] = useState<PartnerTravelAgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [discountById, setDiscountById] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPartnerTravelAgentApplications({
        data: { accessToken, status: "pending" },
      });
      setRows(data);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load travel agent applications."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const runAction = async (row: PartnerTravelAgentApplication, action: "approve" | "reject") => {
    if (action === "approve") {
      const raw = discountById[row.id]?.trim() ?? "";
      const discountPercent = Number(raw);
      if (!raw || Number.isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        setError("Enter a discount percentage between 0 and 100 before approving.");
        return;
      }
    }

    const ok = window.confirm(
      action === "approve"
        ? "Approve this travel agent? A login will be created and a temporary password emailed."
        : "Reject this travel agent application?",
    );
    if (!ok) return;

    setBusyId(row.id);
    setError(null);
    setWarning(null);
    try {
      const result = await reviewPartnerTravelAgentApplication({
        data: {
          accessToken,
          applicationId: row.id,
          action,
          adminNotes: notesById[row.id]?.trim() || undefined,
          discountPercent:
            action === "approve" ? Number(discountById[row.id]?.trim() ?? "0") : undefined,
        },
      });
      if (result.passwordEmailWarning) {
        setWarning(result.passwordEmailWarning);
      }
      setRows((current) => current.filter((item) => item.id !== row.id));
    } catch (err) {
      setError(toErrorMessage(err, "Review failed."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="text-sm luxury-panel-body">Loading applications…</p>;
  }

  if (rows.length === 0) {
    return <p className="text-sm luxury-panel-body">No pending travel agent applications.</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {warning ? <p className="text-sm text-amber-800">{warning}</p> : null}

      {rows.map((row) => {
        const expanded = expandedId === row.id;
        return (
          <article key={row.id} className="rounded-sm border border-[rgb(74_0_0/0.15)] bg-white/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg luxury-panel-heading">{row.companyName}</h3>
                <p className="text-sm luxury-panel-body">
                  {row.fullName} · {row.email} · {row.phone}
                </p>
                <p className="mt-1 text-xs luxury-panel-body opacity-80">
                  Applied {formatDateLong(row.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="luxury-btn-sm dashboard-chrome-btn"
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                >
                  {expanded ? "Hide details" : "View details"}
                </button>
                <button
                  type="button"
                  className="luxury-btn-sm dashboard-chrome-btn"
                  disabled={busyId === row.id}
                  onClick={() => void runAction(row, "reject")}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="luxury-btn-sm"
                  disabled={busyId === row.id}
                  onClick={() => void runAction(row, "approve")}
                >
                  Approve
                </button>
              </div>
            </div>

            {expanded ? (
              <div className="mt-4 grid gap-4 border-t border-[rgb(74_0_0/0.12)] pt-4 sm:grid-cols-2">
                <div>
                  <p className="eyebrow luxury-panel-label mb-1">City</p>
                  <p className="text-sm luxury-panel-body">{row.city}</p>
                </div>
                <div>
                  <p className="eyebrow luxury-panel-label mb-1">GSTIN</p>
                  <p className="text-sm luxury-panel-body">{row.gstNumber}</p>
                </div>
                <div>
                  <p className="eyebrow luxury-panel-label mb-1">PAN</p>
                  <p className="text-sm luxury-panel-body">{row.panNumber}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="eyebrow luxury-panel-label mb-1">Registered address</p>
                  <p className="text-sm luxury-panel-body">{row.companyAddress}</p>
                </div>
                {row.bio ? (
                  <div className="sm:col-span-2">
                    <p className="eyebrow luxury-panel-label mb-1">About</p>
                    <p className="text-sm luxury-panel-body">{row.bio}</p>
                  </div>
                ) : null}
                <div className="sm:col-span-2 flex flex-wrap gap-3 text-sm">
                  <a href={row.passportPhotoUrl} target="_blank" rel="noreferrer" className="text-ember underline">
                    Passport photo
                  </a>
                  {row.gstCertificateUrl ? (
                    <a href={row.gstCertificateUrl} target="_blank" rel="noreferrer" className="text-ember underline">
                      GST certificate
                    </a>
                  ) : null}
                  {row.companyRegistrationUrl ? (
                    <a href={row.companyRegistrationUrl} target="_blank" rel="noreferrer" className="text-ember underline">
                      Company registration
                    </a>
                  ) : null}
                </div>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">
                    Agent discount % (required to approve)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    className="mt-1 w-full max-w-xs rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/60 px-3 py-2 text-sm"
                    value={discountById[row.id] ?? ""}
                    onChange={(e) =>
                      setDiscountById((prev) => ({ ...prev, [row.id]: e.target.value }))
                    }
                    placeholder="e.g. 10"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">
                    Admin notes
                  </span>
                  <textarea
                    className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/60 px-3 py-2 text-sm"
                    rows={2}
                    value={notesById[row.id] ?? ""}
                    onChange={(e) => setNotesById((prev) => ({ ...prev, [row.id]: e.target.value }))}
                  />
                </label>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
