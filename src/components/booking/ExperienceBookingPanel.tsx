import { Link } from "@tanstack/react-router";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import type { Experience, Slot } from "@/data/experiences";
import { bookExperiencePath, guestBookingLimits } from "@/lib/booking-url";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

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
}: ExperienceBookingPanelProps) {
  const sym = exp.currencySymbol ?? "₹";
  const availableSlots = exp.slots.filter((s) => s.available > 0);
  const limits = selectedSlot
    ? guestBookingLimits(exp, selectedSlot.available)
    : { min: exp.minGuestsPerBooking ?? 1, max: exp.maxGuestsPerBooking ?? 10 };
  const totalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;

  const bookSearch = selectedSlot
    ? { slotId: selectedSlot.id, guests }
    : undefined;
  const bookPath = bookExperiencePath(exp.slug, bookSearch);
  const canBookAsGuest = signedIn && userRole === "guest";
  const needsSignIn = !signedIn;

  return (
    <div className="glass rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] p-6 md:p-8">
      <div className="eyebrow mb-3">Available slots</div>

      {exp.slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No bookable dates yet. Check back soon or contact Royal Passage.
        </p>
      ) : availableSlots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          All upcoming sessions are sold out. Browse other experiences or try again later.
        </p>
      ) : (
        <div className="space-y-2">
          {exp.slots.map((slot) => {
            const sold = slot.available === 0;
            const active = selectedSlot?.id === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={sold}
                aria-pressed={active}
                onClick={() => onSelectSlot(slot)}
                className={`flex w-full items-center justify-between border p-4 text-left transition-all ${
                  active
                    ? "border-ember bg-ember/15 text-foreground shadow-[var(--shadow-gold)]"
                    : sold
                      ? "cursor-not-allowed border-[oklch(0.72_0.09_78_/_0.12)] opacity-40"
                      : "border-[oklch(0.72_0.09_78_/_0.22)] hover:border-ember/45"
                }`}
              >
                <div>
                  <div className="font-display text-lg">{formatDateLong(slot.date)}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {slot.start}–{slot.end}
                  </div>
                </div>
                <div className="text-right text-xs">
                  {sold ? (
                    <span className="eyebrow">Sold out</span>
                  ) : (
                    <>
                      <div className="eyebrow opacity-70">Seats</div>
                      <div className="font-display text-lg">
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
          <div className="hairline my-6" />

          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Guests</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {limits.min}–{limits.max} per booking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease guest count"
                disabled={!selectedSlot || guests <= limits.min}
                onClick={() => onGuestsChange(Math.max(limits.min, guests - 1))}
                className="h-9 w-9 border border-[oklch(0.88_0.08_86_/_0.2)] transition-colors hover:border-ember/50 disabled:opacity-40"
              >
                −
              </button>
              <span className="font-display text-xl w-6 text-center">{guests}</span>
              <button
                type="button"
                aria-label="Increase guest count"
                disabled={!selectedSlot || guests >= limits.max}
                onClick={() => onGuestsChange(Math.min(limits.max, guests + 1))}
                className="h-9 w-9 border border-[oklch(0.88_0.08_86_/_0.2)] transition-colors hover:border-ember/50 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {variant === "checkout" && onNotesChange ? (
            <div className="mt-8">
              <h2 className="eyebrow mb-4">Notes (optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
                placeholder="Dietary needs, accessibility requests, or questions for your host…"
                className="w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm"
              />
            </div>
          ) : null}

          <div className="hairline my-6" />

          <div className="flex items-baseline justify-between mb-5">
            <div>
              <div className="eyebrow text-muted-foreground">Estimated total</div>
              <div className="text-xs text-muted-foreground mt-1">
                {sym}
                {exp.pricePerPerson} × {guests} guest{guests > 1 ? "s" : ""}
              </div>
            </div>
            <div className="font-display text-3xl">
              {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
            </div>
          </div>

          <div className="mb-5">
            <PayAtVenueBadge />
          </div>

          {error ? (
            <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {variant === "select" ? (
            <>
              {!selectedSlot ? (
                <span className="flex w-full cursor-not-allowed items-center justify-center rounded-sm bg-ember/50 py-4 text-sm font-medium text-primary-foreground opacity-60">
                  Select a slot
                </span>
              ) : needsSignIn ? (
                <Link
                  to="/sign-in"
                  search={{ redirect: bookPath }}
                  className="flex w-full items-center justify-center rounded-sm bg-ember py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
                >
                  Sign in to book
                </Link>
              ) : !canBookAsGuest ? (
                <p className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] px-4 py-3 text-center text-sm text-muted-foreground">
                  Sign in with a guest account to book this experience.
                </p>
              ) : (
                <Link
                  to="/experiences/$slug/book"
                  params={{ slug: exp.slug }}
                  search={bookSearch}
                  className="flex w-full items-center justify-center rounded-sm bg-ember py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
                >
                  Continue to book
                </Link>
              )}
              <p className="text-[0.65rem] text-muted-foreground text-center mt-3">
                Pay at venue on arrival · Host confirms your booking
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!selectedSlot || busy}
                onClick={onConfirm}
                className="w-full rounded-sm bg-ember py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Request booking"}
              </button>
              <p className="mt-3 text-center text-[0.65rem] text-muted-foreground">
                Your host will confirm. Pay at the venue on arrival.
              </p>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
