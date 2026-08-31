import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { GuestContactFields } from "@/components/booking/GuestContactFields";
import {
  DEFAULT_TRAVEL_AGENT_BOOKING_OPTIONS,
  TravelAgentBookingExtras,
  travelAgentOptionsToPayload,
} from "@/components/travel-agent/TravelAgentBookingExtras";
import {
  CheckoutWizardConfirmRow,
  CheckoutWizardStepBody,
  CheckoutWizardStepFooter,
  CheckoutWizardStepHeader,
  CheckoutWizardStepper,
  CheckoutWizardSummaryPanel,
  CheckoutWizardSummaryRow,
} from "@/components/booking/CheckoutWizardPrimitives";
import { HomestayBookingPanel } from "@/components/homestays/HomestayBookingPanel";
import { HomestayCashPaymentSelector } from "@/components/homestays/HomestayCashPaymentSelector";
import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";
import type { Homestay } from "@/data/homestays";
import { useHomestayCheckout } from "@/hooks/use-homestay-checkout";
import { useGuestContactDetails } from "@/hooks/use-guest-contact-details";
import { formatDateLong } from "@/lib/date-format";
import { buildHomestayBookSearch } from "@/lib/homestay-booking-url";
import { formatMoney } from "@/lib/money";
import { fetchTravelAgentProfile } from "@/lib/partner-travel-agent-fns";
import { isTravelAgentRole, type UserRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type HomestayCheckoutWizardProps = {
  stay: Homestay;
  source: "live" | "static";
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialRoomId?: string;
  initialRoomCount?: number;
  initialExtraBeds?: number;
  onSuccess: (bookingId: string) => void;
  userRole?: string | null;
  backLink: {
    to: "/homestays/$slug";
    params: { slug: string };
    label: string;
  };
};

const STEPS = [
  { id: 1, label: "Dates & guests" },
  { id: 2, label: "Cash payment" },
  { id: 3, label: "Confirm" },
] as const;

export function HomestayCheckoutWizard({
  stay,
  source,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialRoomId,
  initialRoomCount,
  initialExtraBeds,
  onSuccess,
  userRole = null,
  backLink,
}: HomestayCheckoutWizardProps) {
  const navigate = useNavigate();
  const contactDetails = useGuestContactDetails();
  const isTravelAgent = isTravelAgentRole(userRole as UserRole | null);
  const [markupMajor, setMarkupMajor] = useState(0);
  const [clientSendConfirmation, setClientSendConfirmation] = useState(
    DEFAULT_TRAVEL_AGENT_BOOKING_OPTIONS.clientSendConfirmation,
  );
  const [clientEmailIncludePrice, setClientEmailIncludePrice] = useState(
    DEFAULT_TRAVEL_AGENT_BOOKING_OPTIONS.clientEmailIncludePrice,
  );
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);

  useEffect(() => {
    if (!isTravelAgent) return;
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        const token = data.session?.access_token;
        if (!token) return;
        return fetchTravelAgentProfile({ data: { accessToken: token } });
      })
      .then((profile) => {
        if (profile) setDiscountPercent(profile.discountPercent);
      })
      .catch(() => undefined);
  }, [isTravelAgent]);

  const agentOptions = travelAgentOptionsToPayload(
    markupMajor,
    clientSendConfirmation,
    clientEmailIncludePrice,
  );

  const checkout = useHomestayCheckout(stay, {
    initialCheckIn,
    initialCheckOut,
    initialGuests,
    initialRoomId,
    initialRoomCount,
    initialExtraBeds,
    contact: contactDetails.contact,
    syncContact: contactDetails.syncToProfile,
    isTravelAgent,
    agentOptions,
  });
  const bookable = source === "live" && !stay.id.startsWith("stay-");
  const sym = stay.currencySymbol ?? "₹";

  // Keep dates/guests in the URL so the next step (and refresh) keeps the same selection.
  useEffect(() => {
    if (!checkout.checkIn || !checkout.checkOut) return;
    void navigate({
      to: "/homestays/$slug/book",
      params: { slug: stay.slug },
      search: buildHomestayBookSearch({
        checkIn: checkout.checkIn,
        checkOut: checkout.checkOut,
        guests: checkout.guests,
        roomId: checkout.roomId,
        roomCount: checkout.roomCount,
        extraBeds: checkout.extraBedCount,
      }),
      replace: true,
    });
  }, [
    checkout.checkIn,
    checkout.checkOut,
    checkout.extraBedCount,
    checkout.guests,
    checkout.roomCount,
    checkout.roomId,
    navigate,
    stay.slug,
  ]);

  const handleSubmit = async () => {
    contactDetails.setShowErrors(true);
    if (!contactDetails.isValid) return;
    try {
      const bookingId = await checkout.submit();
      if (bookingId) onSuccess(bookingId);
    } catch {
      // Error message is set inside the checkout hook.
    }
  };

  const roomSummary = checkout.selectedRoom
    ? `${checkout.selectedRoom.name}${checkout.roomCount > 1 ? ` × ${checkout.roomCount}` : ""}`
    : "—";

  return (
    <div className="mt-6 space-y-6">
      {!bookable ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body text-sm">
            Live booking opens once homestay listings are published in the database.
          </p>
        </LuxuryCheckoutPanel>
      ) : null}

      <CheckoutWizardStepper steps={STEPS} currentStep={checkout.step} ariaLabel="Stay booking progress" />

      {checkout.step === 1 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Choose your dates"
            description="Select check-in and check-out, then tell us how many guests are staying."
          />
          <CheckoutWizardStepBody>
            <HomestayBookingPanel
              stay={stay}
              checkIn={checkout.checkIn}
              checkOut={checkout.checkOut}
              guests={checkout.guests}
              roomId={checkout.roomId}
              roomCount={checkout.roomCount}
              extraBedCount={checkout.extraBedCount}
              maxGuests={checkout.maxGuests}
              maxRooms={checkout.maxRooms}
              maxExtraBeds={checkout.maxExtra}
              notes={checkout.notes}
              nights={checkout.nights}
              totalMinor={checkout.totalMinor}
              onCheckInChange={checkout.setCheckIn}
              onCheckOutChange={checkout.setCheckOut}
              onGuestsChange={checkout.setGuests}
              onRoomIdChange={checkout.setRoomId}
              onRoomCountChange={checkout.setRoomCount}
              onExtraBedCountChange={checkout.setExtraBedCount}
              onNotesChange={checkout.setNotes}
              hideActions
              bookable={bookable}
            />
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{
              to: backLink.to,
              params: backLink.params,
              hash: "book",
              label: backLink.label,
            }}
            primary={{
              label: "Continue to payment",
              onClick: checkout.goNext,
              disabled: !bookable || checkout.nights < 1,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {checkout.step === 2 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Cash at the homestay"
            description="Homestays on Royal Passage use cash payment only — no cards or online checkout."
          />
          <CheckoutWizardStepBody>
            <dl className="luxury-panel-body mb-6 space-y-0 text-sm">
              <CheckoutWizardConfirmRow
                label="Dates"
                value={
                  <>
                    {formatDateLong(checkout.checkIn)} → {formatDateLong(checkout.checkOut)}
                  </>
                }
              />
              <CheckoutWizardConfirmRow label="Guests" value={String(checkout.guests)} />
              {checkout.selectedRoom ? (
                <CheckoutWizardConfirmRow label="Room" value={roomSummary} />
              ) : null}
            </dl>
            <HomestayCashPaymentSelector
              value={checkout.paymentMethod}
              onChange={checkout.setPaymentMethod}
              surface="light"
            />
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: checkout.goBack }}
            primary={{ label: "Review & confirm", onClick: checkout.goNext }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {checkout.step === 3 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Confirm your stay"
            description="Review your details, then submit your stay request to the host."
          />
          <CheckoutWizardStepBody>
            <GuestContactFields
              value={contactDetails.contact}
              onChange={contactDetails.setContact}
              showErrors={contactDetails.showErrors}
              surface="light"
              heading={isTravelAgent ? "Customer contact" : undefined}
              description={
                isTravelAgent
                  ? "Enter the guest's details for this stay. Confirmation emails can be sent to them separately."
                  : undefined
              }
            />
            {isTravelAgent ? (
              <TravelAgentBookingExtras
                markupMajor={markupMajor}
                onMarkupMajorChange={setMarkupMajor}
                clientSendConfirmation={clientSendConfirmation}
                onClientSendConfirmationChange={setClientSendConfirmation}
                clientEmailIncludePrice={clientEmailIncludePrice}
                onClientEmailIncludePriceChange={setClientEmailIncludePrice}
                discountPercent={discountPercent}
              />
            ) : null}
            <dl className="luxury-panel-body mt-6 space-y-0 text-sm sm:mt-8">
              <CheckoutWizardConfirmRow label="Property" value={stay.title} />
              <CheckoutWizardConfirmRow
                label="Dates"
                value={
                  <>
                    {formatDateLong(checkout.checkIn)} → {formatDateLong(checkout.checkOut)}
                  </>
                }
              />
              <CheckoutWizardConfirmRow label="Guests" value={String(checkout.guests)} />
              {checkout.selectedRoom ? (
                <>
                  <CheckoutWizardConfirmRow label="Room" value={roomSummary} />
                  {checkout.extraBedCount > 0 ? (
                    <CheckoutWizardConfirmRow
                      label="Extra beds"
                      value={String(checkout.extraBedCount)}
                    />
                  ) : null}
                </>
              ) : null}
              <CheckoutWizardConfirmRow
                label="Stay subtotal"
                value={formatMoney(checkout.subtotalMinor, sym)}
              />
              {checkout.gstPercent > 0 ? (
                <CheckoutWizardConfirmRow
                  label={`GST (${checkout.gstPercent}%)`}
                  value={formatMoney(checkout.gstMinor, sym)}
                />
              ) : null}
              <CheckoutWizardConfirmRow
                label="Total (cash at check-in)"
                value={formatMoney(checkout.totalMinor, sym)}
                emphasis
              />
              <div className="flex justify-between gap-4 pb-3">
                <dt className="luxury-panel-body">Payment</dt>
                <dd className="luxury-panel-body">Cash at homestay</dd>
              </div>
            </dl>
            <div className="mt-6">
              <PayAtHomestayBadge surface="light" />
            </div>
            {checkout.error ? <p className="mt-4 text-sm text-destructive">{checkout.error}</p> : null}
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: checkout.goBack }}
            primary={{
              label: checkout.busy ? "Submitting…" : "Request stay",
              onClick: () => void handleSubmit(),
              disabled: checkout.busy || !contactDetails.isValid,
              showArrow: false,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      <CheckoutWizardSummaryPanel
        title="Stay summary"
        heading={stay.title}
        subheading={stay.city}
        total={checkout.nights > 0 ? formatMoney(checkout.totalMinor, sym) : "—"}
        rows={
          <>
            <CheckoutWizardSummaryRow
              label="Check-in"
              value={checkout.checkIn ? formatDateLong(checkout.checkIn) : "—"}
            />
            <CheckoutWizardSummaryRow
              label="Check-out"
              value={checkout.checkOut ? formatDateLong(checkout.checkOut) : "—"}
            />
            <CheckoutWizardSummaryRow
              label="Nights"
              value={checkout.nights > 0 ? String(checkout.nights) : "—"}
              align="left"
            />
            <CheckoutWizardSummaryRow label="Guests" value={String(checkout.guests)} align="left" />
            {checkout.selectedRoom ? (
              <CheckoutWizardSummaryRow label="Room" value={roomSummary} />
            ) : null}
            <CheckoutWizardSummaryRow
              label="Stay"
              value={checkout.nights > 0 ? formatMoney(checkout.subtotalMinor, sym) : "—"}
            />
            {checkout.gstPercent > 0 ? (
              <CheckoutWizardSummaryRow
                label={`GST (${checkout.gstPercent}%)`}
                value={checkout.nights > 0 ? formatMoney(checkout.gstMinor, sym) : "—"}
              />
            ) : null}
            <CheckoutWizardSummaryRow
              label="Payment"
              value={checkout.step >= 2 ? "Cash at homestay" : "—"}
            />
          </>
        }
        footnote="After you submit, your host can confirm your stay. Pay in cash at check-in once approved."
      />
    </div>
  );
}
