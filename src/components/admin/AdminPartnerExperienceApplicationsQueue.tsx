import { useCallback, useEffect, useState } from "react";
import { FALLBACK_CATEGORIES } from "@/lib/experience-categories";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { toErrorMessage } from "@/lib/api/client";
import {
  listPartnerExperienceApplications,
  reviewPartnerExperienceApplication,
  type PartnerExperienceApplication,
} from "@/lib/partner-experience-fns";

type AdminPartnerExperienceApplicationsQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

type SlotDraft = {
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
};

function categoryLabel(slug: string) {
  return FALLBACK_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

function LineList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="eyebrow luxury-panel-label mb-1">{label}</p>
      <ul className="list-disc space-y-0.5 pl-5 text-sm luxury-panel-body">
        {items.map((item) => (
          <li key={`${label}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function defaultSlot(): SlotDraft {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const slotDate = tomorrow.toISOString().slice(0, 10);
  return {
    slotDate,
    startTime: "10:00",
    endTime: "12:00",
    capacity: 8,
  };
}

export function AdminPartnerExperienceApplicationsQueue({
  accessToken,
  refreshKey = 0,
}: AdminPartnerExperienceApplicationsQueueProps) {
  const [rows, setRows] = useState<PartnerExperienceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [slotsById, setSlotsById] = useState<Record<string, SlotDraft[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPartnerExperienceApplications({
        data: { accessToken, status: "pending" },
      });
      setRows(data);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load partner applications."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const slotsFor = (id: string) => slotsById[id] ?? [defaultSlot()];

  const updateSlot = (id: string, index: number, patch: Partial<SlotDraft>) => {
    setSlotsById((prev) => {
      const current = prev[id] ?? [defaultSlot()];
      return {
        ...prev,
        [id]: current.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)),
      };
    });
  };

  const addSlot = (id: string) => {
    setSlotsById((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? [defaultSlot()]), defaultSlot()],
    }));
  };

  const removeSlot = (id: string, index: number) => {
    setSlotsById((prev) => {
      const current = prev[id] ?? [defaultSlot()];
      if (current.length <= 1) return prev;
      return { ...prev, [id]: current.filter((_, i) => i !== index) };
    });
  };

  const runAction = async (applicationId: string, action: "approve" | "reject") => {
    if (action === "approve") {
      const slots = slotsFor(applicationId);
      if (slots.some((s) => !s.slotDate || !s.startTime || !s.endTime || s.capacity < 1)) {
        setError("Fill every session date, time, and capacity before approving.");
        return;
      }
    }

    const ok = window.confirm(
      action === "approve"
        ? "Approve this application? A host login will be created, a password setup email will be sent, and the experience will go live with the sessions you entered."
        : "Reject this partner application?",
    );
    if (!ok) return;

    setBusyId(applicationId);
    setError(null);
    setWarning(null);
    try {
      const result = await reviewPartnerExperienceApplication({
        data: {
          accessToken,
          applicationId,
          action,
          adminNotes: notesById[applicationId]?.trim() || undefined,
          slots: action === "approve" ? slotsFor(applicationId) : undefined,
        },
      });
      if (result.passwordEmailWarning) {
        setWarning(result.passwordEmailWarning);
      }
      await load();
      setExpandedId(null);
    } catch (err) {
      setError(toErrorMessage(err, "Action failed."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="luxury-panel-body py-8 text-sm">Loading partner applications…</p>;
  }

  if (error && rows.length === 0) {
    return (
      <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="luxury-panel-body py-8 text-sm">No partner applications awaiting review.</p>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {warning ? (
        <p className="rounded-sm border border-amber-700/40 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {warning}
        </p>
      ) : null}

      <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
        {rows.map((row) => {
          const open = expandedId === row.id;
          const busy = busyId === row.id;
          const slots = slotsFor(row.id);
          return (
            <li key={row.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setExpandedId(open ? null : row.id)}
                >
                  <p className="luxury-panel-heading font-display text-lg">{row.title}</p>
                  <p className="luxury-panel-body mt-1 text-sm">
                    {row.fullName} · {row.email}
                    {row.phone ? ` · ${row.phone}` : ""} ·{" "}
                    {formatDateLong(row.createdAt.slice(0, 10))}
                  </p>
                  <p className="luxury-panel-body mt-1 text-xs opacity-80">
                    {categoryLabel(row.categorySlug)} · {row.city}
                  </p>
                </button>
                <button
                  type="button"
                  className="luxury-btn-sm luxury-btn-primary"
                  onClick={() => setExpandedId(open ? null : row.id)}
                >
                  {open ? "Hide details" : "Review"}
                </button>
              </div>

              {open ? (
                <div className="mt-4 space-y-5 border-t border-[rgb(74_0_0/0.1)] pt-4">
                  <section className="space-y-3">
                    <h3 className="font-display text-lg luxury-panel-heading">Applicant</h3>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm luxury-panel-body">
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Full name</span>
                        {row.fullName}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Email</span>
                        <a href={`mailto:${row.email}`} className="luxury-panel-link underline">
                          {row.email}
                        </a>
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Phone</span>
                        <a href={`tel:${row.phone}`} className="luxury-panel-link underline">
                          {row.phone}
                        </a>
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">City</span>
                        {row.city}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Submitted</span>
                        {formatDateLong(row.createdAt.slice(0, 10))}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">PAN</span>
                        {row.panNumber || "—"}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Trade licence</span>
                        {row.tradeLicenseUrl ? (
                          <a
                            href={row.tradeLicenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="luxury-panel-link underline"
                          >
                            View licence
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">
                          Trade licence expiry
                        </span>
                        {row.tradeLicenseExpiresOn
                          ? formatDateLong(row.tradeLicenseExpiresOn)
                          : "—"}
                      </p>
                      <div>
                        <span className="eyebrow luxury-panel-label mb-1 block">Passport-size photo</span>
                        {row.passportPhotoUrl ? (
                          <a href={row.passportPhotoUrl} target="_blank" rel="noreferrer">
                            <img
                              src={row.passportPhotoUrl}
                              alt="Passport photo"
                              className="mt-1 h-24 w-20 rounded-sm border border-[rgb(74_0_0/0.12)] object-cover"
                            />
                          </a>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </div>
                    {row.bio ? (
                      <div>
                        <p className="eyebrow luxury-panel-label mb-1">Bio</p>
                        <p className="luxury-panel-body whitespace-pre-wrap text-sm leading-relaxed">
                          {row.bio}
                        </p>
                      </div>
                    ) : null}
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-display text-lg luxury-panel-heading">Experience</h3>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm luxury-panel-body">
                      <p className="sm:col-span-2">
                        <span className="eyebrow luxury-panel-label mb-1 block">Title</span>
                        {row.title}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Category</span>
                        {categoryLabel(row.categorySlug)}
                      </p>
                      {row.tagline ? (
                        <p className="sm:col-span-2">
                          <span className="eyebrow luxury-panel-label mb-1 block">Tagline</span>
                          {row.tagline}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <p className="eyebrow luxury-panel-label mb-1">Description</p>
                      <p className="luxury-panel-body whitespace-pre-wrap text-sm leading-relaxed">
                        {row.description}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-display text-lg luxury-panel-heading">Location & pricing</h3>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm luxury-panel-body">
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">City / region</span>
                        Mysuru{row.region ? ` · ${row.region}` : ""}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Address</span>
                        {row.address}
                      </p>
                      {row.mapLink ? (
                        <p className="sm:col-span-2">
                          <span className="eyebrow luxury-panel-label mb-1 block">Map link</span>
                          <a
                            href={row.mapLink}
                            target="_blank"
                            rel="noreferrer"
                            className="luxury-panel-link break-all underline"
                          >
                            {row.mapLink}
                          </a>
                        </p>
                      ) : (
                        <p>
                          <span className="eyebrow luxury-panel-label mb-1 block">Map link</span>
                          —
                        </p>
                      )}
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Duration</span>
                        {row.durationMinutes} minutes
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Price / person</span>
                        {formatMoney(row.pricePerPersonMinor)}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Min guests</span>
                        {row.minGuests}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Max guests</span>
                        {row.maxGuests}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-display text-lg luxury-panel-heading">Photos</h3>
                    {row.galleryUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {row.galleryUrls.map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-sm border border-[rgb(74_0_0/0.12)]"
                          >
                            <img
                              src={url}
                              alt={`Photo ${index + 1}`}
                              className="aspect-[4/3] w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="luxury-panel-body text-sm">No photos submitted.</p>
                    )}
                  </section>

                  <section className="space-y-3">
                    <h3 className="font-display text-lg luxury-panel-heading">Details</h3>
                    <LineList label="Inclusions" items={row.inclusions} />
                    <LineList label="Exclusions" items={row.exclusions} />
                    <LineList label="Requirements" items={row.requirements} />
                    {row.inclusions.length === 0 &&
                    row.exclusions.length === 0 &&
                    row.requirements.length === 0 ? (
                      <p className="luxury-panel-body text-sm">No inclusions, exclusions, or requirements.</p>
                    ) : null}
                  </section>

                  <div className="dashboard-panel-card space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="eyebrow luxury-panel-label">Sessions to publish</p>
                      <button
                        type="button"
                        className="text-xs underline luxury-panel-link"
                        onClick={() => addSlot(row.id)}
                        disabled={busy}
                      >
                        Add session
                      </button>
                    </div>
                    <p className="luxury-panel-body text-xs">
                      At least one bookable session is required. The experience goes live when you
                      approve.
                    </p>
                    {slots.map((slot, index) => (
                      <div
                        key={`${row.id}-slot-${index}`}
                        className="grid gap-2 sm:grid-cols-4"
                      >
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Date</span>
                          <input
                            type="date"
                            value={slot.slotDate}
                            onChange={(e) => updateSlot(row.id, index, { slotDate: e.target.value })}
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Start</span>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(row.id, index, { startTime: e.target.value })
                            }
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">End</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(row.id, index, { endTime: e.target.value })}
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Capacity</span>
                          <div className="mt-1 flex gap-2">
                            <input
                              type="number"
                              min={1}
                              value={slot.capacity}
                              onChange={(e) =>
                                updateSlot(row.id, index, {
                                  capacity: Number(e.target.value) || 1,
                                })
                              }
                              className="w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5 input-no-spin"
                              disabled={busy}
                            />
                            {slots.length > 1 ? (
                              <button
                                type="button"
                                className="text-xs text-destructive"
                                onClick={() => removeSlot(row.id, index)}
                                disabled={busy}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <label className="block text-sm">
                    <span className="eyebrow luxury-panel-label">Admin notes (optional)</span>
                    <textarea
                      rows={2}
                      value={notesById[row.id] ?? ""}
                      onChange={(e) =>
                        setNotesById((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-3 py-2 text-sm"
                      disabled={busy}
                    />
                  </label>

                  <p className="luxury-panel-body text-xs leading-relaxed">
                    Approving creates a host login for {row.email}, emails a password setup link,
                    publishes this experience with your sessions, and marks the host as approved.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      className="luxury-btn-sm luxury-btn-primary disabled:opacity-60"
                      onClick={() => void runAction(row.id, "approve")}
                    >
                      {busy ? "Working…" : "Approve & publish"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="luxury-btn-sm dashboard-chrome-btn disabled:opacity-60"
                      onClick={() => void runAction(row.id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
