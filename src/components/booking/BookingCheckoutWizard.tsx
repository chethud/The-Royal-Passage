import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
    <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-14">
      <div>
        {!isLiveExperience ? (
          <p className="mb-6 text-sm text-destructive">
            This listing is preview-only and cannot be booked online. Please choose a live experience.
          </p>
        ) : null}

        <nav aria-label="Booking progress" className="mb-10 border-b border-[#C8A25A]/15 pb-6">
          <ol className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {STEPS.map((item, index) => {
              const active = step === item.id;
              const done = step > item.id;
              return (
                <li key={item.id} className="flex items-center gap-6">
                  <span
                    className={`flex items-center gap-2.5 text-[0.65rem] uppercase tracking-[0.16em] transition-colors ${
                      active
                        ? "text-[#D4AF6A]"
                        : done
                          ? "text-foreground/80"
                          : "text-muted-foreground/45"
                    }`}
                  >
                    <span
                      className={`font-display text-sm ${
                        active ? "text-[#D4AF6A]" : done ? "text-foreground/70" : "text-muted-foreground/40"
                      }`}
                    >
                      {String(item.id).padStart(2, "0")}
                    </span>
                    <span className={active ? "font-semibold" : ""}>{item.label}</span>
                  </span>
                  {index < STEPS.length - 1 ? (
                    <span className="hidden h-px w-8 bg-[#C8A25A]/20 sm:block" aria-hidden />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        {step === 1 ? (
          <div>
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">Choose your date & slot</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Pick an available session in the next 7 days and set how many guests are joining.
            </p>
            <div className="mt-8">
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
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                to={backLink.to}
                params={backLink.params}
                hash={backLink.hash}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
              >
                {backLink.label}
              </Link>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={goNext}
                className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                Continue to payment
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">Payment method</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your booking request goes to the host for approval. Payment is collected at the venue.
            </p>
            <div className="mt-8">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={goBack}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="luxury-btn-sm luxury-btn-primary inline-flex items-center gap-2"
              >
                Review booking
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">Confirm your request</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              We will notify your host. They can accept or decline. You pay at the venue after they
              confirm.
            </p>
            <div className="mt-8">
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
            <div className="mt-6">
              <button
                type="button"
                onClick={goBack}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
              >
                Back
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="h-fit border-t border-[#C8A25A]/12 pt-8 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
        <h2 className="font-display text-xl tracking-wide text-[#F7F1E8]">Booking summary</h2>
        <div className="hairline my-5" />

        <dl className="space-y-3.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Experience</dt>
            <dd className="text-right text-foreground/90">{exp.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Host</dt>
            <dd className="text-right text-foreground/90">{exp.hostName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right text-foreground/90">
              {selectedSlot ? formatDateLong(selectedSlot.date) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Time</dt>
            <dd className="text-right text-foreground/90">
              {selectedSlot ? `${selectedSlot.start}–${selectedSlot.end}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="text-foreground/90">{guests}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="text-right text-foreground/90">{step >= 2 ? "Pay at venue" : "—"}</dd>
          </div>
        </dl>

        <div className="hairline my-5" />

        <div className="flex items-baseline justify-between gap-4">
          <span className="eyebrow text-muted-foreground">Estimated total</span>
          <span className="font-display text-3xl tracking-tight text-[#F7F1E8]">
            {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
          </span>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground/90">
          After you submit, your host receives the request and can approve or decline. You will see
          the status in your booking history.
        </p>
      </aside>
    </div>
  );
}
