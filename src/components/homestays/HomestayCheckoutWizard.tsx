import { Link } from "@tanstack/react-router";

import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

import { HomestayBookingPanel } from "@/components/homestays/HomestayBookingPanel";

import { HomestayCashPaymentSelector } from "@/components/homestays/HomestayCashPaymentSelector";

import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";

import type { Homestay } from "@/data/homestays";

import { useHomestayCheckout } from "@/hooks/use-homestay-checkout";

import { formatDateLong } from "@/lib/date-format";

import { formatMoney } from "@/lib/money";



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

  backLink,

}: HomestayCheckoutWizardProps) {

  const checkout = useHomestayCheckout(stay, {

    initialCheckIn,

    initialCheckOut,

    initialGuests,

    initialRoomId,

    initialRoomCount,

    initialExtraBeds,

  });

  const bookable = source === "live" && !stay.id.startsWith("stay-");

  const sym = stay.currencySymbol ?? "₹";



  const handleSubmit = async () => {

    const bookingId = await checkout.submit();

    if (bookingId) onSuccess(bookingId);

  };



  return (

    <div className="mt-6 space-y-6">

      {!bookable ? (

        <LuxuryCheckoutPanel>

          <p className="luxury-panel-body text-sm">

            Live booking opens once homestay listings are published in the database.

          </p>

        </LuxuryCheckoutPanel>

      ) : null}



      <LuxuryCheckoutPanel className="py-5 sm:py-6">

        <nav aria-label="Stay booking progress">

          <ol className="flex flex-wrap items-center gap-x-8 gap-y-3">

            {STEPS.map((item, index) => {

              const active = checkout.step === item.id;

              const done = checkout.step > item.id;

              return (

                <li key={item.id} className="flex items-center gap-8">

                  <span

                    className={`flex items-center gap-2.5 text-[0.65rem] uppercase tracking-[0.18em] transition-colors ${

                      active

                        ? "luxury-panel-heading font-semibold"

                        : done

                          ? "luxury-panel-heading"

                          : "luxury-panel-step-text-idle"

                    }`}

                  >

                    <span

                      className={`flex h-8 w-8 items-center justify-center rounded-full border font-display text-xs transition-colors ${

                        active

                          ? "luxury-panel-step-active"

                          : done

                            ? "luxury-panel-step-done"

                            : "luxury-panel-step-idle"

                      }`}

                    >

                      {String(item.id).padStart(2, "0")}

                    </span>

                    <span>{item.label}</span>

                  </span>

                  {index < STEPS.length - 1 ? (

                    <span className="luxury-panel-step-connector hidden h-0.5 w-10 sm:block" aria-hidden />

                  ) : null}

                </li>

              );

            })}

          </ol>

        </nav>

      </LuxuryCheckoutPanel>



      {checkout.step === 1 ? (

        <LuxuryCheckoutPanel>

          <h2 className="luxury-panel-heading font-display text-2xl tracking-[0.02em] md:text-3xl">

            Choose your dates

          </h2>

          <p className="luxury-panel-body mt-2 max-w-xl text-sm leading-relaxed">

            Select check-in and check-out, then tell us how many guests are staying.

          </p>

          <div className="luxury-panel-divider mt-8 border-t pt-8">

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

          </div>

          <div className="luxury-panel-divider mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">

            <Link

              to={backLink.to}

              params={backLink.params}

              hash="book"

              className="luxury-panel-link text-[0.65rem] font-semibold uppercase tracking-[0.14em]"

            >

              {backLink.label}

            </Link>

            <button

              type="button"

              disabled={!bookable || checkout.nights < 1}

              onClick={checkout.goNext}

              className="luxury-btn-sm luxury-btn-primary disabled:opacity-50"

            >

              Continue to payment

            </button>

          </div>

        </LuxuryCheckoutPanel>

      ) : null}



      {checkout.step === 2 ? (

        <LuxuryCheckoutPanel>

          <h2 className="luxury-panel-heading font-display text-2xl tracking-[0.02em] md:text-3xl">

            Cash at the homestay

          </h2>

          <p className="luxury-panel-body mt-2 max-w-xl text-sm leading-relaxed">

            Homestays on Royal Passage use cash payment only — no cards or online checkout.

          </p>

          <div className="luxury-panel-divider mt-8 border-t pt-8">

            <HomestayCashPaymentSelector

              value={checkout.paymentMethod}

              onChange={checkout.setPaymentMethod}

              surface="light"

            />

          </div>

          <div className="luxury-panel-divider mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">

            <button type="button" onClick={checkout.goBack} className="luxury-btn-sm luxury-btn-panel-outline">

              Back

            </button>

            <button type="button" onClick={checkout.goNext} className="luxury-btn-sm luxury-btn-primary">

              Review & confirm

            </button>

          </div>

        </LuxuryCheckoutPanel>

      ) : null}



      {checkout.step === 3 ? (

        <LuxuryCheckoutPanel>

          <h2 className="luxury-panel-heading font-display text-2xl tracking-[0.02em] md:text-3xl">

            Confirm your stay

          </h2>

          <dl className="luxury-panel-body mt-8 space-y-4 text-sm">

            <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">

              <dt>Property</dt>

              <dd className="text-right font-medium">{stay.title}</dd>

            </div>

            <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">

              <dt>Dates</dt>

              <dd className="text-right">

                {formatDateLong(checkout.checkIn)} → {formatDateLong(checkout.checkOut)}

              </dd>

            </div>

            <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">

              <dt>Guests</dt>

              <dd>{checkout.guests}</dd>

            </div>

            {checkout.selectedRoom ? (

              <>

                <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">

                  <dt>Room</dt>

                  <dd className="text-right">

                    {checkout.selectedRoom.name}

                    {checkout.roomCount > 1 ? ` × ${checkout.roomCount}` : ""}

                  </dd>

                </div>

                {checkout.extraBedCount > 0 ? (

                  <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">

                    <dt>Extra beds</dt>

                    <dd>{checkout.extraBedCount}</dd>

                  </div>

                ) : null}

              </>

            ) : null}

            <div className="flex justify-between gap-4 border-b luxury-panel-divider pb-3">

              <dt>Total (cash at check-in)</dt>

              <dd className="font-display text-xl text-[#4A0000]">{formatMoney(checkout.totalMinor, sym)}</dd>

            </div>

            <div className="flex justify-between gap-4 pb-3">

              <dt>Payment</dt>

              <dd>Cash at homestay</dd>

            </div>

          </dl>

          <div className="mt-6">

            <PayAtHomestayBadge surface="light" />

          </div>

          {checkout.error ? <p className="mt-4 text-sm text-destructive">{checkout.error}</p> : null}

          <div className="luxury-panel-divider mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">

            <button type="button" onClick={checkout.goBack} className="luxury-btn-sm luxury-btn-panel-outline">

              Back

            </button>

            <button

              type="button"

              disabled={checkout.busy}

              onClick={() => void handleSubmit()}

              className="luxury-btn-sm luxury-btn-primary disabled:opacity-50"

            >

              {checkout.busy ? "Submitting…" : "Request stay"}

            </button>

          </div>

        </LuxuryCheckoutPanel>

      ) : null}

    </div>

  );

}

