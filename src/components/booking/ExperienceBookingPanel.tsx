import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import type { Experience, Slot } from "@/data/experiences";
import {
  BOOKING_WINDOW_DAYS,
  filterSlotsWithinBookingWindow,
  formatBookingWindowRange,
} from "@/lib/booking-window";
import { bookExperiencePath, guestBookingLimits } from "@/lib/booking-url";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { isGuestAccount, isStaffRole } from "@/lib/roles";
import { useTodayIsoDate } from "@/hooks/use-today-iso-date";
import { formatTime12h } from "@/lib/weekday-slots";

type ExperienceBookingPanelProps = {
  exp: Pick<
    Experience,
    "slug" | "pricePerPerson" | "currencySymbol" | "slots" | "minGuestsPerBooking" | "maxGuestsPerBooking"
  >;
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  guests: number;
  onGuestsChange: (guests: number) => void;
  variant: "select" | "checkout";
  signedIn?: boolean;
  userRole?: string | null;
  notes?: string;
  onNotesChange?: (value: string) => void;
  onConfirm?: () => void;
  busy?: boolean;
  error?: string | null;
  /** Hide sign-in / continue / confirm buttons (used inside multi-step checkout). */
  hideActions?: boolean;
  /** Cream checkout panel vs dark experience detail page. */
  surface?: "light" | "dark";
};

function panelTone(surface: "light" | "dark") {
  if (surface === "light") {
    return {
      eyebrow: "luxury-panel-label",
      muted: "luxury-panel-body",
      slotActive: "border-[#4A0000] text-[#4A0000]",
      slotIdle:
        "border-transparent text-[#4A0000]/75 hover:border-[#4A0000]/50 hover:text-[#4A0000]",
      slotHover: "group-hover:text-[#4A0000]",
      seats: "text-[#4A0000]",
      guestBtn: "text-[#4A0000]/80 hover:text-[#4A0000]",
      guestCount: "text-[#4A0000]",
      total: "text-[#4A0000]",
      textarea:
        "border-[#4A0000]/25 text-[#4A0000] placeholder:text-[#5B0000]/45 focus:border-[#4A0000]/55",
    };
  }

  return {
    eyebrow: "text-[#D4AF6A]/90",
    muted: "text-muted-foreground/90",
    slotActive: "border-[#D4AF6A] text-foreground",
    slotIdle: "border-transparent text-foreground/75 hover:border-[#C8A25A]/35 hover:text-foreground",
    slotHover: "group-hover:text-[#D4AF6A]",
    seats: "text-[#D4AF6A]",
    guestBtn: "text-[#D4AF6A] hover:text-[#F7F1E8]",
    guestCount: "text-foreground",
    total: "text-[#F7F1E8]",
    textarea:
      "border-[#C8A25A]/25 text-foreground placeholder:text-muted-foreground/55 focus:border-[#C8A25A]/55",
  };
}

function groupSlotsByDate(slots: Slot[]): { date: string; slots: Slot[] }[] {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const day = slot.date.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(slot);
    groups.set(day, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySlots]) => ({
      date,
      slots: [...daySlots].sort((a, b) => a.start.localeCompare(b.start)),
    }));
}

function firstBookableDate(groups: { date: string; slots: Slot[] }[]): string | null {
  const match = groups.find((group) => group.slots.some((slot) => slot.available > 0));
  return match?.date ?? groups[0]?.date ?? null;
}

function DateSlotPicker({
  groups,
  selectedSlot,
  onSelectSlot,
  expandedDate,
  onExpandedDateChange,
  surface,
  tone,
}: {
  groups: { date: string; slots: Slot[] }[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  expandedDate: string | null;
  onExpandedDateChange: (date: string | null) => void;
  surface: "light" | "dark";
  tone: ReturnType<typeof panelTone>;
}) {
  const dateCard =
    surface === "light"
      ? "border border-[#4A0000]/10 bg-[#FFFBF5]/60"
      : "border border-[#C8A25A]/15 bg-[#1a0a0a]/40";
  const dateCardActive =
    surface === "light"
      ? "border-[#4A0000]/25 bg-[#FFF8EE] shadow-sm"
      : "border-[#C8A25A]/30 bg-[#1f0d0d]/70";
  const slotRowIdle =
    surface === "light"
      ? "border border-transparent bg-white/70 text-[#4A0000]/80 hover:border-[#4A0000]/20 hover:bg-white"
      : "border border-transparent bg-black/20 text-foreground/80 hover:border-[#C8A25A]/25 hover:bg-black/30";
  const slotRowActive =
    surface === "light"
      ? "border-[#4A0000]/35 bg-white text-[#4A0000] shadow-sm"
      : "border-[#C8A25A]/40 bg-black/35 text-foreground";

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const open = expandedDate === group.date;
        const availableCount = group.slots.filter((slot) => slot.available > 0).length;
        const soldOut = availableCount === 0;
        const hasSelected = selectedSlot?.date.slice(0, 10) === group.date;

        return (
          <div
            key={group.date}
            className={`overflow-hidden rounded-xl transition-all duration-200 ${open || hasSelected ? dateCardActive : dateCard}`}
          >
            <button
              type="button"
              aria-expanded={open}
              disabled={soldOut}
              onClick={() => onExpandedDateChange(open ? null : group.date)}
              className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A0000]/25 disabled:cursor-not-allowed ${
                soldOut ? "opacity-45" : ""
              }`}
            >
              <div
                className={`h-12 w-1 shrink-0 rounded-full transition-colors ${
                  hasSelected || open
                    ? surface === "light"
                      ? "bg-[#4A0000]"
                      : "bg-[#D4AF6A]"
                    : surface === "light"
                      ? "bg-[#4A0000]/20"
                      : "bg-[#C8A25A]/25"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`font-display text-base tracking-wide sm:text-lg ${
                    surface === "light" ? "text-[#4A0000]" : "text-foreground"
                  }`}
                >
                  {formatDateLong(group.date)}
                </div>
                <p className={`mt-1 text-xs ${tone.muted}`}>
                  {soldOut
                    ? "Sold out"
                    : `${availableCount} session${availableCount === 1 ? "" : "s"} available`}
                </p>
              </div>
              {!soldOut ? (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  } ${surface === "light" ? "text-[#4A0000]/70" : "text-[#D4AF6A]/90"}`}
                  strokeWidth={1.75}
                />
              ) : null}
            </button>

            {open && !soldOut ? (
              <div
                className={`space-y-2 border-t px-4 pb-4 pt-3 ${
                  surface === "light" ? "border-[#4A0000]/10" : "border-[#C8A25A]/15"
                }`}
              >
                {group.slots.map((slot) => {
                  const sold = slot.available === 0;
                  const active = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={sold}
                      aria-pressed={active}
                      onClick={() => onSelectSlot(slot)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A0000]/25 ${
                        active ? slotRowActive : sold ? "cursor-not-allowed opacity-40" : slotRowIdle
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-medium ${active ? tone.seats : ""}`}>
                          {formatTime12h(slot.start)} – {formatTime12h(slot.end)}
                        </div>
                        <div className={`mt-0.5 text-[0.65rem] uppercase tracking-[0.12em] ${tone.muted}`}>
                          {sold ? "Sold out" : "Select session"}
                        </div>
                      </div>
                      {!sold ? (
                        <div className="text-right">
                          <div className={`eyebrow text-[0.6rem] ${tone.muted}`}>Seats</div>
                          <div className={`font-display text-lg ${tone.seats}`}>
                            {slot.available}/{slot.capacity}
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ExperienceBookingPanel({
  exp,
  selectedSlot,
  onSelectSlot,
  guests,
  onGuestsChange,
  variant,
  signedIn = false,
  userRole = null,
  notes = "",
  onNotesChange,
  onConfirm,
  busy = false,
  error = null,
  hideActions = false,
  surface = "dark",
}: ExperienceBookingPanelProps) {
  const sym = exp.currencySymbol ?? "₹";
  const tone = panelTone(surface);
  const today = useTodayIsoDate();
  const visibleSlots = useMemo(
    () => filterSlotsWithinBookingWindow(exp.slots, today),
    [exp.slots, today],
  );
  const windowLabel = useMemo(() => formatBookingWindowRange(today), [today]);
  const availableSlots = visibleSlots.filter((s) => s.available > 0);
  const slotGroups = useMemo(() => groupSlotsByDate(visibleSlots), [visibleSlots]);
  const [expandedDate, setExpandedDate] = useState<string | null>(() => firstBookableDate(slotGroups));

  useEffect(() => {
    if (selectedSlot) {
      setExpandedDate(selectedSlot.date.slice(0, 10));
    }
  }, [selectedSlot?.id, selectedSlot?.date]);

  useEffect(() => {
    if (slotGroups.length === 0) {
      setExpandedDate(null);
      return;
    }
    setExpandedDate((current) => {
      if (current && slotGroups.some((group) => group.date === current)) return current;
      return firstBookableDate(slotGroups);
    });
  }, [slotGroups]);
  const limits = selectedSlot
    ? guestBookingLimits(exp, selectedSlot.available)
    : { min: exp.minGuestsPerBooking ?? 1, max: exp.maxGuestsPerBooking ?? 10 };
  const totalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;

  const bookSearch = selectedSlot ? { slotId: selectedSlot.id, guests } : undefined;
  const bookPath = bookExperiencePath(exp.slug, bookSearch);
  const canBookAsGuest = signedIn && isGuestAccount(userRole);
  const needsSignIn = !signedIn;
  const staffSignedIn = signedIn && isStaffRole(userRole);

  return (
    <div className="space-y-8">
      <div>
        <div className={`eyebrow mb-2 ${tone.eyebrow}`}>Available slots</div>
        <p className={`text-xs leading-relaxed ${tone.muted}`}>
          Showing {BOOKING_WINDOW_DAYS} days from today ({windowLabel}). New dates are added by
          hosts on a rolling weekly basis.
        </p>
      </div>

      {visibleSlots.length === 0 ? (
        <p className={`text-sm ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
          No bookable dates in the next 7 days. Check back soon or contact Royal Passage.
        </p>
      ) : availableSlots.length === 0 ? (
        <p className={`text-sm ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
          All upcoming sessions are sold out. Browse other experiences or try again later.
        </p>
      ) : (
        <DateSlotPicker
          groups={slotGroups}
          selectedSlot={selectedSlot}
          onSelectSlot={onSelectSlot}
          expandedDate={expandedDate}
          onExpandedDateChange={(date) => {
            setExpandedDate(date);
            if (!date) return;
            const group = slotGroups.find((entry) => entry.date === date);
            const openSlots = group?.slots.filter((slot) => slot.available > 0) ?? [];
            if (openSlots.length === 1) onSelectSlot(openSlots[0]!);
          }}
          surface={surface}
          tone={tone}
        />
      )}

      {availableSlots.length > 0 ? (
        <>
          <div className="hairline" />

          <div className="flex items-center justify-between gap-6">
            <div>
              <div className={`eyebrow ${tone.eyebrow}`}>Guests</div>
              <p className={`mt-1 text-xs ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
                {limits.min}–{limits.max} per booking
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Decrease guest count"
                disabled={!selectedSlot || guests <= limits.min}
                onClick={() => onGuestsChange(Math.max(limits.min, guests - 1))}
                className={`inline-flex h-9 w-9 items-center justify-center transition-colors disabled:cursor-default disabled:opacity-35 ${tone.guestBtn}`}
              >
                <Minus className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <span className={`w-8 text-center font-display text-2xl ${tone.guestCount}`}>{guests}</span>
              <button
                type="button"
                aria-label="Increase guest count"
                disabled={!selectedSlot || guests >= limits.max}
                onClick={() => onGuestsChange(Math.min(limits.max, guests + 1))}
                className={`inline-flex h-9 w-9 items-center justify-center transition-colors disabled:cursor-default disabled:opacity-35 ${tone.guestBtn}`}
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {variant === "checkout" && onNotesChange ? (
            <div>
              <h2 className={`eyebrow mb-3 ${tone.eyebrow}`}>Notes (optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
                placeholder="Dietary needs, accessibility requests, or questions for your host…"
                className={`w-full resize-none border-0 border-b bg-transparent px-0 py-3 text-sm focus:outline-none focus:ring-0 ${tone.textarea}`}
              />
            </div>
          ) : null}

          <div className="hairline" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className={`eyebrow ${surface === "light" ? "luxury-panel-label" : "text-muted-foreground"}`}>
                Estimated total
              </div>
              <div className={`mt-1 text-xs ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
                {sym}
                {exp.pricePerPerson} × {guests} guest{guests > 1 ? "s" : ""}
              </div>
            </div>
            <div className={`font-display text-3xl tracking-tight ${tone.total}`}>
              {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
            </div>
          </div>

          <PayAtVenueBadge surface={surface} />

          {error && !hideActions ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {hideActions ? null : variant === "select" ? (
            <>
              {!selectedSlot ? (
                <span
                  className={`inline-flex w-full items-center justify-center py-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                    surface === "light" ? "luxury-panel-body opacity-70" : "text-muted-foreground/60"
                  }`}
                >
                  Select a date and session
                </span>
              ) : needsSignIn ? (
                <Link
                  to="/sign-in"
                  search={{ redirect: bookPath }}
                  className="luxury-btn-sm luxury-btn-primary inline-flex w-full items-center justify-center gap-2"
                >
                  Sign in to book
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : staffSignedIn ? (
                <p className={`text-center text-sm ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
                  Host and admin accounts cannot book experiences. Sign in with a guest account.
                </p>
              ) : !canBookAsGuest ? (
                <p className={`text-center text-sm ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
                  Sign in with a guest account to book this experience.
                </p>
              ) : (
                <Link
                  to="/experiences/$slug/book"
                  params={{ slug: exp.slug }}
                  search={bookSearch}
                  className="luxury-btn-sm luxury-btn-primary inline-flex w-full items-center justify-center gap-2"
                >
                  Continue to book
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <p
                className={`text-center text-[0.65rem] tracking-wide ${
                  surface === "light" ? "luxury-panel-body" : "text-muted-foreground/80"
                }`}
              >
                Pay at venue on arrival · Host confirms your booking
              </p>
            </>
          ) : (
            <>
              {!selectedSlot ? (
                <p className={`text-center text-sm ${surface === "light" ? "luxury-panel-body" : "text-muted-foreground"}`}>
                  Select a date, then choose your session to continue.
                </p>
              ) : null}
              <button
                type="button"
                disabled={!selectedSlot || busy}
                onClick={() => onConfirm?.()}
                className="luxury-btn-sm luxury-btn-primary w-full disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Request booking"}
              </button>
              <p
                className={`text-center text-[0.65rem] tracking-wide ${
                  surface === "light" ? "luxury-panel-body" : "text-muted-foreground/80"
                }`}
              >
                Your host will confirm. Pay at the venue on arrival.
              </p>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
