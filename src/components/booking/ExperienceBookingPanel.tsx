import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import type { Experience, Slot } from "@/data/experiences";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";
import { bookExperiencePath, guestBookingLimits } from "@/lib/booking-url";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { isGuestAccount, isStaffRole } from "@/lib/roles";

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
};

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
}: ExperienceBookingPanelProps) {
  const sym = exp.currencySymbol ?? "₹";
  const visibleSlots = filterSlotsWithinBookingWindow(exp.slots);
  const availableSlots = visibleSlots.filter((s) => s.available > 0);
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
        <div className="eyebrow mb-2 text-[#D4AF6A]/90">Available slots</div>
        <p className="text-xs leading-relaxed text-muted-foreground/90">
          Showing the next 7 days from today. New dates are added by hosts on a rolling weekly basis.
        </p>
      </div>

      {visibleSlots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No bookable dates in the next 7 days. Check back soon or contact Royal Passage.
        </p>
      ) : availableSlots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          All upcoming sessions are sold out. Browse other experiences or try again later.
        </p>
      ) : (
        <div className="space-y-1">
          {visibleSlots.map((slot) => {
            const sold = slot.available === 0;
            const active = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={sold}
                aria-pressed={active}
                onClick={() => onSelectSlot(slot)}
                className={`group flex w-full items-center justify-between border-l-2 py-3.5 pl-4 pr-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]/40 ${
                  active
                    ? "border-[#D4AF6A] text-foreground"
                    : sold
                      ? "cursor-not-allowed border-transparent opacity-40"
                      : "border-transparent text-foreground/75 hover:border-[#C8A25A]/35 hover:text-foreground"
                }`}
              >
                <div>
                  <div className="font-display text-lg tracking-wide transition-colors group-hover:text-[#D4AF6A]">
                    {formatDateLong(slot.date)}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {slot.start}–{slot.end}
                  </div>
                </div>
                <div className="text-right text-xs">
                  {sold ? (
                    <span className="eyebrow text-muted-foreground">Sold out</span>
                  ) : (
                    <>
                      <div className="eyebrow text-muted-foreground/80">Seats</div>
                      <div className="font-display text-lg text-[#D4AF6A]">
                        {slot.available}/{slot.capacity}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {availableSlots.length > 0 ? (
        <>
          <div className="hairline" />

          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="eyebrow text-[#D4AF6A]/90">Guests</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {limits.min}–{limits.max} per booking
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Decrease guest count"
                disabled={!selectedSlot || guests <= limits.min}
                onClick={() => onGuestsChange(Math.max(limits.min, guests - 1))}
                className="inline-flex h-9 w-9 items-center justify-center text-[#D4AF6A] transition-colors hover:text-[#F7F1E8] disabled:cursor-default disabled:opacity-35"
              >
                <Minus className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <span className="w-8 text-center font-display text-2xl">{guests}</span>
              <button
                type="button"
                aria-label="Increase guest count"
                disabled={!selectedSlot || guests >= limits.max}
                onClick={() => onGuestsChange(Math.min(limits.max, guests + 1))}
                className="inline-flex h-9 w-9 items-center justify-center text-[#D4AF6A] transition-colors hover:text-[#F7F1E8] disabled:cursor-default disabled:opacity-35"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {variant === "checkout" && onNotesChange ? (
            <div>
              <h2 className="eyebrow mb-3 text-[#D4AF6A]/90">Notes (optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
                placeholder="Dietary needs, accessibility requests, or questions for your host…"
                className="w-full resize-none border-0 border-b border-[#C8A25A]/25 bg-transparent px-0 py-3 text-sm text-foreground placeholder:text-muted-foreground/55 focus:border-[#C8A25A]/55 focus:outline-none focus:ring-0"
              />
            </div>
          ) : null}

          <div className="hairline" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow text-muted-foreground">Estimated total</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {sym}
                {exp.pricePerPerson} × {guests} guest{guests > 1 ? "s" : ""}
              </div>
            </div>
            <div className="font-display text-3xl tracking-tight text-[#F7F1E8]">
              {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
            </div>
          </div>

          <PayAtVenueBadge />

          {error && !hideActions ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {hideActions ? null : variant === "select" ? (
            <>
              {!selectedSlot ? (
                <span className="inline-flex w-full items-center justify-center py-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
                  Select a slot
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
                <p className="text-center text-sm text-muted-foreground">
                  Host and admin accounts cannot book experiences. Sign in with a guest account.
                </p>
              ) : !canBookAsGuest ? (
                <p className="text-center text-sm text-muted-foreground">
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
              <p className="text-center text-[0.65rem] tracking-wide text-muted-foreground/80">
                Pay at venue on arrival · Host confirms your booking
              </p>
            </>
          ) : (
            <>
              {!selectedSlot ? (
                <p className="text-center text-sm text-muted-foreground">
                  Select an available date to continue.
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
              <p className="text-center text-[0.65rem] tracking-wide text-muted-foreground/80">
                Your host will confirm. Pay at the venue on arrival.
              </p>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
