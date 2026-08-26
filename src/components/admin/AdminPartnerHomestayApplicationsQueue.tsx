import { useCallback, useEffect, useState } from "react";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { toErrorMessage } from "@/lib/api/client";
import {
  listPartnerHomestayApplications,
  reviewPartnerHomestayApplication,
  type PartnerHomestayApplication,
} from "@/lib/partner-homestay-fns";

type AdminPartnerHomestayApplicationsQueueProps = {
  accessToken: string;
  refreshKey?: number;
};

type RoomDraft = {
  name: string;
  category: string;
  capacity: number;
  priceMajor: number;
  weekendPriceMajor: number;
  totalUnits: number;
};

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

function defaultRoom(priceMajor = 0): RoomDraft {
  return {
    name: "Room 1",
    category: "",
    capacity: 2,
    priceMajor,
    weekendPriceMajor: priceMajor,
    totalUnits: 1,
  };
}

export function AdminPartnerHomestayApplicationsQueue({
  accessToken,
  refreshKey = 0,
}: AdminPartnerHomestayApplicationsQueueProps) {
  const [rows, setRows] = useState<PartnerHomestayApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [roomsById, setRoomsById] = useState<Record<string, RoomDraft[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPartnerHomestayApplications({
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

  const roomsFor = (row: PartnerHomestayApplication) =>
    roomsById[row.id] ?? [defaultRoom(Math.round(row.pricePerNightMinor / 100))];

  const updateRoom = (id: string, index: number, patch: Partial<RoomDraft>, fallbackPrice: number) => {
    setRoomsById((prev) => {
      const current = prev[id] ?? [defaultRoom(fallbackPrice)];
      return {
        ...prev,
        [id]: current.map((room, i) => (i === index ? { ...room, ...patch } : room)),
      };
    });
  };

  const addRoom = (row: PartnerHomestayApplication) => {
    const price = Math.round(row.pricePerNightMinor / 100);
    setRoomsById((prev) => ({
      ...prev,
      [row.id]: [...(prev[row.id] ?? [defaultRoom(price)]), defaultRoom(price)],
    }));
  };

  const removeRoom = (row: PartnerHomestayApplication, index: number) => {
    const price = Math.round(row.pricePerNightMinor / 100);
    setRoomsById((prev) => {
      const current = prev[row.id] ?? [defaultRoom(price)];
      if (current.length <= 1) return prev;
      return { ...prev, [row.id]: current.filter((_, i) => i !== index) };
    });
  };

  const runAction = async (row: PartnerHomestayApplication, action: "approve" | "reject") => {
    if (action === "approve") {
      const rooms = roomsFor(row);
      if (rooms.some((r) => !r.name.trim() || r.capacity < 1 || r.priceMajor <= 0)) {
        setError("Fill every room name, capacity, and price before approving.");
        return;
      }
    }

    const ok = window.confirm(
      action === "approve"
        ? "Approve this application? An owner login will be created, a temporary password will be emailed, and the homestay will go live with the rooms you entered."
        : "Reject this partner application?",
    );
    if (!ok) return;

    setBusyId(row.id);
    setError(null);
    setWarning(null);
    try {
      const result = await reviewPartnerHomestayApplication({
        data: {
          accessToken,
          applicationId: row.id,
          action,
          adminNotes: notesById[row.id]?.trim() || undefined,
          rooms:
            action === "approve"
              ? roomsFor(row).map((room) => ({
                  name: room.name.trim(),
                  category: room.category.trim() || undefined,
                  capacity: room.capacity,
                  pricePerNightMinor: room.priceMajor * 100,
                  weekendPricePerNightMinor:
                    (room.weekendPriceMajor || room.priceMajor) * 100,
                  totalUnits: room.totalUnits,
                }))
              : undefined,
        },
      });
      if (action === "approve" && result.passwordEmailWarning) {
        setWarning(result.passwordEmailWarning);
        window.alert(
          `Homestay published.\n\nEmail note:\n${result.passwordEmailWarning}`,
        );
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
          const rooms = roomsFor(row);
          const weekday = Math.round(row.pricePerNightMinor / 100);
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
                    {row.propertyType} · {row.city}
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
                        <span className="eyebrow luxury-panel-label mb-1 block">FSSAI ID</span>
                        {row.fssaiId || "—"}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">PAN</span>
                        {row.panNumber || "—"}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">GST number</span>
                        {row.gstNumber || "Not provided (price ≤ ₹8,000)"}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Homestay license</span>
                        {row.licenseCertificateUrl ? (
                          <a
                            href={row.licenseCertificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="luxury-panel-link underline"
                          >
                            View license
                          </a>
                        ) : (
                          "—"
                        )}
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
                    <h3 className="font-display text-lg luxury-panel-heading">Property</h3>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm luxury-panel-body">
                      <p className="sm:col-span-2">
                        <span className="eyebrow luxury-panel-label mb-1 block">Title</span>
                        {row.title}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Property type</span>
                        {row.propertyType}
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
                        <span className="eyebrow luxury-panel-label mb-1 block">
                          Weekday / room / day
                        </span>
                        {formatMoney(row.pricePerNightMinor)}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">
                          Weekend / room / day
                        </span>
                        {row.weekendPricePerNightMinor
                          ? formatMoney(row.weekendPricePerNightMinor)
                          : formatMoney(row.pricePerNightMinor)}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Bedrooms</span>
                        {row.bedrooms}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Bathrooms</span>
                        {row.bathrooms}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Max guests</span>
                        {row.maxGuests}
                      </p>
                      <p>
                        <span className="eyebrow luxury-panel-label mb-1 block">Check-in / out</span>
                        {row.checkInTime} → {row.checkOutTime}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="eyebrow luxury-panel-label mb-1 block">Extra bed</span>
                        {row.extraBedAvailable
                          ? `Yes · weekday ${formatMoney(row.extraBedPricePerNightMinor)} · weekend ${formatMoney(row.weekendExtraBedPricePerNightMinor)} · ${row.extraBedsPerRoom} per room`
                          : "No"}
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
                    <h3 className="font-display text-lg luxury-panel-heading">House details</h3>
                    <LineList label="Amenities" items={row.amenities} />
                    <LineList label="House rules" items={row.houseRules} />
                    {row.amenities.length === 0 && row.houseRules.length === 0 ? (
                      <p className="luxury-panel-body text-sm">No amenities or house rules listed.</p>
                    ) : null}
                  </section>

                  <div className="dashboard-panel-card space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="eyebrow luxury-panel-label">Rooms to publish</p>
                      <button
                        type="button"
                        className="text-xs underline luxury-panel-link"
                        onClick={() => addRoom(row)}
                        disabled={busy}
                      >
                        Add room
                      </button>
                    </div>
                    {rooms.map((room, index) => (
                      <div key={`${row.id}-room-${index}`} className="grid gap-2 sm:grid-cols-3">
                        <label className="text-xs sm:col-span-2">
                          <span className="eyebrow luxury-panel-label">Name</span>
                          <input
                            value={room.name}
                            onChange={(e) =>
                              updateRoom(row.id, index, { name: e.target.value }, weekday)
                            }
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Capacity</span>
                          <input
                            type="number"
                            min={1}
                            value={room.capacity}
                            onChange={(e) =>
                              updateRoom(
                                row.id,
                                index,
                                { capacity: Number(e.target.value) || 1 },
                                weekday,
                              )
                            }
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5 input-no-spin"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Weekday ₹</span>
                          <input
                            type="number"
                            min={1}
                            value={room.priceMajor || ""}
                            onChange={(e) =>
                              updateRoom(
                                row.id,
                                index,
                                { priceMajor: Number(e.target.value) || 0 },
                                weekday,
                              )
                            }
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5 input-no-spin"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Weekend ₹</span>
                          <input
                            type="number"
                            min={1}
                            value={room.weekendPriceMajor || ""}
                            onChange={(e) =>
                              updateRoom(
                                row.id,
                                index,
                                { weekendPriceMajor: Number(e.target.value) || 0 },
                                weekday,
                              )
                            }
                            className="mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5 input-no-spin"
                            disabled={busy}
                          />
                        </label>
                        <label className="text-xs">
                          <span className="eyebrow luxury-panel-label">Units</span>
                          <div className="mt-1 flex gap-2">
                            <input
                              type="number"
                              min={1}
                              value={room.totalUnits}
                              onChange={(e) =>
                                updateRoom(
                                  row.id,
                                  index,
                                  { totalUnits: Number(e.target.value) || 1 },
                                  weekday,
                                )
                              }
                              className="w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/70 px-2 py-1.5 input-no-spin"
                              disabled={busy}
                            />
                            {rooms.length > 1 ? (
                              <button
                                type="button"
                                className="text-xs text-destructive"
                                onClick={() => removeRoom(row, index)}
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
                    Approving creates an owner login for {row.email}, emails a temporary password
                    (or a password setup link if Resend fails), and publishes this homestay with your
                    rooms.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      className="luxury-btn-sm luxury-btn-primary disabled:opacity-60"
                      onClick={() => void runAction(row, "approve")}
                    >
                      {busy ? "Working…" : "Approve & publish"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="luxury-btn-sm dashboard-chrome-btn disabled:opacity-60"
                      onClick={() => void runAction(row, "reject")}
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
