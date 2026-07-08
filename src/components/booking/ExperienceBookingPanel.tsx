import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import {
  BookingIntro,
  BookingNotesField,
  BookingPanelFootnote,
  BookingPanelStack,
  BookingStepper,
  BookingTotalSummary,
} from "@/components/booking/BookingPanelPrimitives";
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
import { useBookingClock } from "@/hooks/use-today-iso-date";
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
      ? "luxury-slot-date"
      : "border border-[#C8A25A]/15 bg-[#1a0a0a]/40";
  const dateCardActive =
    surface === "light"
      ? "luxury-slot-date luxury-slot-date--active"
      : "border-[#C8A25A]/30 bg-[#1f0d0d]/70";
  const slotRowIdle =
    surface === "light"
      ? "luxury-slot-row"
      : "border border-transparent bg-black/20 text-foreground/80 hover:border-[#C8A25A]/25 hover:bg-black/30";
  const slotRowActive =
    surface === "light"
      ? "luxury-slot-row luxury-slot-row--selected"
      : "border border-[#D4AF6A]/55 bg-[#2a1212] text-foreground shadow-[0_6px_18px_-12px_rgb(0_0_0/0.55)]";

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {groups.map((group) => {
        const open = expandedDate === group.date;
        const availableCount = group.slots.filter((slot) => slot.available > 0).length;
        const soldOut = availableCount === 0;
        const hasSelected = selectedSlot?.date.slice(0, 10) === group.date;

        return (
          <div
            key={group.date}
            className={`overflow-hidden rounded-lg sm:rounded-xl transition-all duration-200 ${open || hasSelected ? dateCardActive : dateCard}`}
          >
            <button
              type="button"
              aria-expanded={open}
              disabled={soldOut}
              onClick={() => onExpandedDateChange(open ? null : group.date)}
              className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors luxury-slot-focus disabled:cursor-not-allowed sm:gap-4 sm:px-4 sm:py-4 ${
                soldOut ? "opacity-45" : ""
              }`}
            >
              <div
                className={`h-10 w-1 shrink-0 rounded-full transition-colors sm:h-12 ${
                  hasSelected || open
                    ? surface === "light"
                      ? "luxury-slot-date__rail--active"
                      : "bg-[#D4AF6A]"
                    : surface === "light"
                      ? "luxury-slot-date__rail"
                      : "bg-[#C8A25A]/25"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`font-display text-[0.95rem] tracking-wide sm:text-lg ${
                    surface === "light" ? "luxury-panel-heading" : "text-foreground"
                  }`}
                >
                  {formatDateLong(group.date)}
                </div>
                <p className={`mt-0.5 text-[0.68rem] sm:mt-1 sm:text-xs ${tone.muted}`}>
                  {soldOut
                    ? "Sold out"
                    : `${availableCount} session${availableCount === 1 ? "" : "s"} available`}
                </p>
              </div>
              {!soldOut ? (
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 sm:h-4 sm:w-4 ${
                    open ? "rotate-180" : ""
                  } ${surface === "light" ? "text-[#8B6914]/85" : "text-[#D4AF6A]/90"}`}
                  strokeWidth={1.75}
                />
              ) : null}
            </button>

            {open && !soldOut ? (
              <div
                className={`space-y-2 border-t px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3 ${
                  surface === "light" ? "luxury-slot-date__divider" : "border-[#C8A25A]/15"
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
                      aria-label={
                        sold
                          ? `${formatTime12h(slot.start)} to ${formatTime12h(slot.end)}, sold out`
                          : active
                            ? `${formatTime12h(slot.start)} to ${formatTime12h(slot.end)}, selected`
                            : `${formatTime12h(slot.start)} to ${formatTime12h(slot.end)}, select session`
                      }
                      onClick={() => onSelectSlot(slot)}
                      className={`relative flex w-full items-center justify-between gap-2.5 rounded-lg py-2.5 text-left transition-all duration-200 luxury-slot-focus sm:gap-3 sm:py-3 ${
                        active ? `pl-4 pr-3 ${slotRowActive}` : sold ? "cursor-not-allowed px-3 opacity-40 sm:px-3.5" : `px-3 sm:px-3.5 ${slotRowIdle}`
                      }`}
                    >
                      {active ? (
                        <span
                          className={`absolute bottom-2 left-1.5 top-2 w-1 rounded-full sm:bottom-2.5 sm:left-2 sm:top-2.5 ${
                            surface === "light" ? "luxury-slot-row__rail" : "bg-[#D4AF6A]"
                          }`}
                          aria-hidden
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className={`text-[0.9rem] font-semibold sm:text-sm ${active && surface === "light" ? "luxury-panel-heading" : active ? tone.seats : ""}`}>
                          {formatTime12h(slot.start)} – {formatTime12h(slot.end)}
                        </div>
                        <div
                          className={`mt-0.5 flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.1em] sm:gap-1.5 sm:text-[0.65rem] sm:tracking-[0.12em] ${
                            active
                              ? surface === "light"
                                ? "luxury-slot-row__selected-label"
                                : "font-semibold text-[#D4AF6A]"
                              : tone.muted
                          }`}
                        >
                          {active ? (
                            <>
                              <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                              Selected
                            </>
                          ) : sold ? (
                            "Sold out"
                          ) : (
                            "Select session"
                          )}
                        </div>
                      </div>
                      {!sold ? (
                        <div className="shrink-0 text-right">
                          <div className={`eyebrow text-[0.55rem] sm:text-[0.6rem] ${tone.muted}`}>Seats</div>
                          <div className={`font-display text-base sm:text-lg ${surface === "light" ? "luxury-panel-heading" : tone.seats}`}>
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
  const { today, now } = useBookingClock();
  const visibleSlots = useMemo(
    () => filterSlotsWithinBookingWindow(exp.slots, today, now),
    [exp.slots, today, now],
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
    <BookingPanelStack>
      <BookingIntro label="Available slots" surface={surface}>
        Showing {BOOKING_WINDOW_DAYS} days from today ({windowLabel}). New dates are added by
        hosts on a rolling weekly basis.
      </BookingIntro>

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

          <BookingStepper
            label="Guests"
            hint={`${limits.min}–${limits.max} per booking`}
            value={guests}
            min={limits.min}
            max={limits.max}
            onChange={onGuestsChange}
            surface={surface}
            disabled={!selectedSlot}
          />

          {variant === "checkout" && onNotesChange ? (
            <BookingNotesField
              value={notes}
              onChange={onNotesChange}
              placeholder="Dietary needs, accessibility requests, or questions for your host…"
              surface={surface}
            />
          ) : null}

          <div className="hairline" />

          <BookingTotalSummary
            surface={surface}
            breakdown={
              <>
                {sym}
                {exp.pricePerPerson} × {guests} guest{guests > 1 ? "s" : ""}
              </>
            }
            total={selectedSlot ? formatMoney(totalMinor, sym) : "—"}
          />

          <PayAtVenueBadge surface={surface} />

          {error && !hideActions ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {hideActions ? null : variant === "select" ? (
            <>
              {!selectedSlot ? (
                <span
                  className={`inline-flex w-full items-center justify-center py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] sm:py-3 sm:text-[0.65rem] sm:tracking-[0.14em] ${
                    surface === "light" ? "luxury-panel-body opacity-70" : "text-muted-foreground/60"
                  }`}
                >
                  Select a date and session
                </span>
              ) : needsSignIn ? (
                <Link
                  to="/sign-in"
                  search={{ redirect: bookPath }}
                  className="luxury-btn-sm luxury-btn-primary inline-flex w-full items-center justify-center gap-1.5 sm:gap-2"
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
                  className="luxury-btn-sm luxury-btn-primary inline-flex w-full items-center justify-center gap-1.5 sm:gap-2"
                >
                  Continue to book
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <BookingPanelFootnote surface={surface}>
                Pay at venue on arrival · Host confirms your booking
              </BookingPanelFootnote>
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
              <BookingPanelFootnote surface={surface}>
                Your host will confirm. Pay at the venue on arrival.
              </BookingPanelFootnote>
            </>
          )}
        </>
      ) : null}
    </BookingPanelStack>
  );
}
