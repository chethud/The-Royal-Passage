import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { PaymentMethodSelector } from "@/components/booking/PaymentMethodSelector";
import {
  CheckoutWizardStepBody,
  CheckoutWizardStepFooter,
  CheckoutWizardStepHeader,
  CheckoutWizardStepper,
  CheckoutWizardSummaryPanel,
  CheckoutWizardSummaryRow,
} from "@/components/booking/CheckoutWizardPrimitives";
import type { Experience } from "@/data/experiences";
import { useCheckoutBooking } from "@/hooks/use-checkout-booking";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";

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

  const gstPercent = Number(exp.gstPercent ?? 0);
  const subtotalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;
  const gstMinor = gstPercent > 0 ? Math.round((subtotalMinor * gstPercent) / 100) : 0;

  const handleSubmit = async () => {
    const bookingId = await submit();
    if (bookingId) onSuccess(bookingId);
  };

  return (
    <div className="mt-6 space-y-6">
      {!isLiveExperience ? (
        <LuxuryCheckoutPanel>
          <p className="text-sm text-destructive">
            This listing is preview-only and cannot be booked online. Please choose a live
            experience.
          </p>
        </LuxuryCheckoutPanel>
      ) : null}

      <CheckoutWizardStepper steps={STEPS} currentStep={step} ariaLabel="Booking progress" />

      {step === 1 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Choose your date & slot"
            description="Pick an available session in the next 7 days and set how many guests are joining."
          />
          <CheckoutWizardStepBody>
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
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{
              to: backLink.to,
              params: backLink.params,
              hash: backLink.hash,
              label: backLink.label,
            }}
            primary={{
              label: "Continue to payment",
              onClick: goNext,
              disabled: !selectedSlot,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 2 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Payment method"
            description="Your booking request goes to the host for approval. Payment is collected at the venue."
          />
          <CheckoutWizardStepBody>
            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} surface="light" />
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{ label: "Review booking", onClick: goNext }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 3 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Confirm your request"
            description="We will notify your host. They can accept or decline. You pay at the venue after they confirm."
          />
          <CheckoutWizardStepBody>
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
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter back={{ label: "Back", onClick: goBack }} />
        </LuxuryCheckoutPanel>
      ) : null}

      <CheckoutWizardSummaryPanel
        heading={exp.title}
        subheading={
          <>
            {exp.city} · {exp.hostName}
          </>
        }
        total={selectedSlot ? formatMoney(totalMinor, sym) : "—"}
        rows={
          <>
            <CheckoutWizardSummaryRow
              label="Date"
              value={selectedSlot ? formatDateLong(selectedSlot.date) : "—"}
            />
            <CheckoutWizardSummaryRow
              label="Time"
              value={
                selectedSlot
                  ? `${formatTime12h(selectedSlot.start)} – ${formatTime12h(selectedSlot.end)}`
                  : "—"
              }
            />
            <CheckoutWizardSummaryRow label="Guests" value={String(guests)} align="left" />
            <CheckoutWizardSummaryRow
              label="Experience"
              value={selectedSlot ? formatMoney(subtotalMinor, sym) : "—"}
            />
            {gstPercent > 0 ? (
              <CheckoutWizardSummaryRow
                label={`GST (${gstPercent}%)`}
                value={selectedSlot ? formatMoney(gstMinor, sym) : "—"}
              />
            ) : null}
            <CheckoutWizardSummaryRow label="Payment" value={step >= 2 ? "Pay at venue" : "—"} />
          </>
        }
        footnote="After you submit, your host receives the request and can approve or decline. You will see the status in your booking history."
      />
    </div>
  );
}
