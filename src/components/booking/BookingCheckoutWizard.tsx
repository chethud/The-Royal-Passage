import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
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
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
      <div className="space-y-6">
        {!isLiveExperience ? (
          <LuxuryCheckoutPanel>
            <p className="text-sm text-destructive">
              This listing is preview-only and cannot be booked online. Please choose a live
              experience.
            </p>
          </LuxuryCheckoutPanel>
        ) : null}

        <LuxuryCheckoutPanel className="py-5 sm:py-6">
          <nav aria-label="Booking progress">
            <ol className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {STEPS.map((item, index) => {
                const active = step === item.id;
                const done = step > item.id;
                return (
                  <li key={item.id} className="flex items-center gap-8">
                    <span
                      className={`flex items-center gap-2.5 text-[0.65rem] uppercase tracking-[0.18em] transition-colors ${
                        active
                          ? "luxury-panel-heading font-semibold"
                          : done
                            ? "luxury-panel-label"
                            : "text-[#4A0000]/35"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border font-display text-xs transition-colors ${
                          active
                            ? "border-[#C8A25A]/55 bg-[#C8A25A]/12 luxury-panel-heading"
                            : done
                              ? "border-[#C8A25A]/45 luxury-panel-label"
                              : "border-[#4A0000]/15 text-[#4A0000]/35"
                        }`}
                      >
                        {String(item.id).padStart(2, "0")}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    {index < STEPS.length - 1 ? (
                      <span className="luxury-panel-divider-bg hidden h-px w-10 sm:block" aria-hidden />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        </LuxuryCheckoutPanel>

        {step === 1 ? (
          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-2xl tracking-tight md:text-3xl">
              Choose your date & slot
            </h2>
            <p className="luxury-panel-body mt-2 max-w-xl text-sm leading-relaxed">
              Pick an available session in the next 7 days and set how many guests are joining.
            </p>
            <div className="luxury-panel-divider mt-8 border-t pt-8">
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
                surface="light"
              />
            </div>
            <div className="luxury-panel-divider mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
              <Link
                to={backLink.to}
                params={backLink.params}
                hash={backLink.hash}
                className="luxury-panel-link text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
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
          </LuxuryCheckoutPanel>
        ) : null}

        {step === 2 ? (
          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-2xl tracking-tight md:text-3xl">
              Payment method
            </h2>
            <p className="luxury-panel-body mt-2 max-w-xl text-sm leading-relaxed">
              Your booking request goes to the host for approval. Payment is collected at the venue.
            </p>
            <div className="luxury-panel-divider mt-8 border-t pt-8">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} surface="light" />
            </div>
            <div className="luxury-panel-divider mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
              <button
                type="button"
                onClick={goBack}
                className="luxury-panel-link text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
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
          </LuxuryCheckoutPanel>
        ) : null}

        {step === 3 ? (
          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-2xl tracking-tight md:text-3xl">
              Confirm your request
            </h2>
            <p className="luxury-panel-body mt-2 max-w-xl text-sm leading-relaxed">
              We will notify your host. They can accept or decline. You pay at the venue after they
              confirm.
            </p>
            <div className="luxury-panel-divider mt-8 border-t pt-8">
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
                surface="light"
              />
            </div>
            <div className="luxury-panel-divider mt-6 border-t pt-6">
              <button
                type="button"
                onClick={goBack}
                className="luxury-panel-link text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
              >
                Back
              </button>
            </div>
          </LuxuryCheckoutPanel>
        ) : null}
      </div>

      <aside className="h-fit lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
        <LuxuryCheckoutPanel>
          {exp.image ? (
            <div className="mb-5 overflow-hidden rounded-sm border border-[#C8A25A]/25">
              <img src={exp.image} alt="" className="aspect-[16/10] w-full object-cover" />
            </div>
          ) : null}

          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Booking summary</h2>
          <div className="luxury-panel-divider-bg my-5 h-px" />

          <dl className="space-y-3.5 text-sm">
            <SummaryRow label="Experience" value={exp.title} />
            <SummaryRow label="Host" value={exp.hostName} />
            <SummaryRow
              label="Date"
              value={selectedSlot ? formatDateLong(selectedSlot.date) : "—"}
            />
            <SummaryRow
              label="Time"
              value={selectedSlot ? `${selectedSlot.start}–${selectedSlot.end}` : "—"}
            />
            <SummaryRow label="Guests" value={String(guests)} align="left" />
            <SummaryRow label="Payment" value={step >= 2 ? "Pay at venue" : "—"} />
          </dl>

          <div className="luxury-panel-divider-bg my-5 h-px" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="eyebrow luxury-panel-body">Estimated total</span>
            <span className="luxury-panel-heading font-display text-3xl tracking-tight">
              {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
            </span>
          </div>

          <p className="luxury-panel-body mt-5 text-xs leading-relaxed">
            After you submit, your host receives the request and can approve or decline. You will
            see the status in your booking history.
          </p>
        </LuxuryCheckoutPanel>
      </aside>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  align = "right",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="luxury-panel-body shrink-0">{label}</dt>
      <dd className={`luxury-panel-heading min-w-0 ${align === "right" ? "text-right" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
