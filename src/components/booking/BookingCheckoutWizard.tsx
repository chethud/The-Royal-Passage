import { Link } from "@tanstack/react-router";
import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { PaymentMethodSelector } from "@/components/booking/PaymentMethodSelector";
import type { Experience } from "@/data/experiences";
import { useCheckoutBooking } from "@/hooks/use-checkout-booking";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type BookingCheckoutWizardProps = {
  exp: Experience;
  source: "live" | "static";
  initialSlotId?: string;
  initialGuests?: number;
  backLink: {
    to: "/dashboard/cart" | "/experiences/$slug";
    params?: { slug: string };
    hash?: string;
    label: string;
  };
  onSuccess: (bookingId: string) => void;
  userRole: string | null;
};

const STEPS = [
  { id: 1, label: "Date & slot" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Confirm" },
] as const;

export function BookingCheckoutWizard({
  exp,
  source,
  initialSlotId,
  initialGuests,
  backLink,
  onSuccess,
  userRole,
}: BookingCheckoutWizardProps) {
  const checkout = useCheckoutBooking({
    exp,
    source,
    initialSlotId,
    initialGuests,
  });

  const {
    step,
    goNext,
    goBack,
    selectedSlot,
    setSelectedSlot,
    guests,
    setGuests,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    busy,
    error,
    isLiveExperience,
    sym,
    totalMinor,
    submit,
  } = checkout;

  const handleSubmit = async () => {
    const bookingId = await submit();
    if (bookingId) onSuccess(bookingId);
  };

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        {!isLiveExperience ? (
          <div className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This listing is preview-only and cannot be booked online. Please choose a live experience.
          </div>
        ) : null}

        <ol className="mb-8 flex flex-wrap gap-2 sm:gap-4">
          {STEPS.map((item) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <li
                key={item.id}
                className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                  active
                    ? "border-ember bg-ember/15 text-ember"
                    : done
                      ? "border-ember/35 text-foreground"
                      : "border-[oklch(0.72_0.09_78_/_0.22)] text-muted-foreground"
                }`}
              >
                <span className="font-semibold">{item.id}</span>
                <span>{item.label}</span>
              </li>
            );
          })}
        </ol>

        {step === 1 ? (
          <div>
            <h2 className="font-display text-2xl">Choose your date & slot</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick an available session in the next 7 days and set how many guests are joining.
            </p>
            <div className="mt-6">
              <ExperienceBookingPanel
                exp={exp}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                guests={guests}
                onGuestsChange={setGuests}
                variant="select"
                signedIn
                userRole={userRole}
                hideActions
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={backLink.to}
                params={backLink.params}
                hash={backLink.hash}
                className="luxury-btn-sm luxury-btn-secondary"
              >
                {backLink.label}
              </Link>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={goNext}
                className="luxury-btn-sm luxury-btn-primary disabled:opacity-50"
              >
                Continue to payment
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="font-display text-2xl">Payment method</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your booking request goes to the host for approval. Payment is collected at the venue.
            </p>
            <div className="mt-6 glass rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] p-6">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={goBack} className="luxury-btn-sm luxury-btn-secondary">
                Back
              </button>
              <button type="button" onClick={goNext} className="luxury-btn-sm luxury-btn-primary">
                Review booking
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="font-display text-2xl">Confirm your request</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We will notify your host. They can accept or decline. You pay at the venue after they
              confirm.
            </p>
            <div className="mt-6">
              <ExperienceBookingPanel
                exp={exp}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                guests={guests}
                onGuestsChange={setGuests}
                variant="checkout"
                signedIn
                userRole={userRole}
                notes={notes}
                onNotesChange={setNotes}
                onConfirm={() => void handleSubmit()}
                busy={busy}
                error={error}
              />
            </div>
            <div className="mt-4">
              <button type="button" onClick={goBack} className="luxury-btn-sm luxury-btn-secondary">
                Back
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="glass-strong h-fit rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
        <h2 className="font-display text-2xl">Booking summary</h2>
        <div className="hairline my-5" />

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Experience</dt>
            <dd className="text-right">{exp.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Host</dt>
            <dd className="text-right">{exp.hostName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right">
              {selectedSlot ? formatDateLong(selectedSlot.date) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Time</dt>
            <dd className="text-right">
              {selectedSlot ? `${selectedSlot.start}–${selectedSlot.end}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Guests</dt>
            <dd>{guests}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="text-right">{step >= 2 ? "Pay at venue" : "—"}</dd>
          </div>
        </dl>

        <div className="hairline my-5" />

        <div className="flex items-baseline justify-between">
          <span className="eyebrow text-muted-foreground">Estimated total</span>
          <span className="font-display text-3xl">
            {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
          </span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          After you submit, your host receives the request and can approve or decline. You will see
          the status in your booking history.
        </p>
      </aside>
    </div>
  );
}
