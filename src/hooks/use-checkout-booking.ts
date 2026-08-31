import { useCallback, useEffect, useMemo, useState } from "react";
import type { Experience, Slot } from "@/data/experiences";
import { createBooking } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";
import { useBookingClock } from "@/hooks/use-today-iso-date";
import { guestBookingLimits } from "@/lib/booking-url";
import { removeCartItem } from "@/lib/cart-storage";
import type { PaymentMethod } from "@/components/booking/PaymentMethodSelector";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

import type { GuestContactDetails } from "@/lib/guest-contact";
import type { TravelAgentBookingOptions } from "@/components/travel-agent/TravelAgentBookingExtras";
import { applyTravelAgentPricing } from "@/lib/travel-agent-pricing";

type UseCheckoutBookingOptions = {
  exp: Experience;
  source: "live" | "static";
  initialSlotId?: string;
  initialGuests?: number;
  syncContact: () => Promise<void>;
  isTravelAgent?: boolean;
  agentDiscountPercent?: number;
  contact?: GuestContactDetails;
  agentOptions?: TravelAgentBookingOptions;
};

export function useCheckoutBooking({
  exp,
  source,
  initialSlotId,
  initialGuests,
  syncContact,
  isTravelAgent = false,
  agentDiscountPercent = 0,
  contact,
  agentOptions,
}: UseCheckoutBookingOptions) {
  const { today, now } = useBookingClock();
  const bookableSlots = useMemo(
    () => filterSlotsWithinBookingWindow(exp.slots, today, now),
    [exp.slots, today, now],
  );

  const initialSlot = useMemo(() => {
    const fromInitial = initialSlotId
      ? bookableSlots.find((slot) => slot.id === initialSlotId && slot.available > 0)
      : null;
    return fromInitial ?? bookableSlots.find((slot) => slot.available > 0) ?? null;
  }, [bookableSlots, initialSlotId]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(initialSlot);
  const [guests, setGuests] = useState(() => {
    if (!initialSlot) return 1;
    const { min, max } = guestBookingLimits(exp, initialSlot.available);
    const preferred = initialGuests ?? min;
    return Math.min(Math.max(min, preferred), max);
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLiveExperience = source === "live";
  const sym = exp.currencySymbol ?? "₹";
  const gstPercent = Number(exp.gstPercent ?? 0);
  const listSubtotalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;
  const agentMarkupMinor = isTravelAgent ? agentOptions?.agentMarkupMinor ?? 0 : 0;
  const agentPricing = applyTravelAgentPricing(
    listSubtotalMinor,
    gstPercent,
    isTravelAgent ? agentDiscountPercent : 0,
    agentMarkupMinor,
  );
  const subtotalMinor = agentPricing.discountedSubtotalMinor;
  const gstMinor = agentPricing.gstMinor;
  const totalMinor = agentPricing.totalMinor;

  useEffect(() => {
    if (!selectedSlot) return;
    const { min, max } = guestBookingLimits(exp, selectedSlot.available);
    setGuests((current) => Math.min(Math.max(min, current), max));
  }, [exp, selectedSlot]);

  const goNext = useCallback(() => {
    setError(null);
    setStep((current) => (current < 3 ? ((current + 1) as 1 | 2 | 3) : current));
  }, []);

  const goBack = useCallback(() => {
    setError(null);
    setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3) : current));
  }, []);

  const submit = useCallback(async (): Promise<string | null> => {
    if (!selectedSlot) return null;
    if (!isLiveExperience) {
      setError("This experience is not available for online booking yet.");
      return null;
    }
    if (paymentMethod !== "cod") {
      setError("Only pay-at-venue booking is available right now.");
      return null;
    }

    setBusy(true);
    setError(null);

    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again to complete your booking.");

      if (!isTravelAgent) {
        await syncContact();
      }

      const result = await createBooking(token, {
        slotId: selectedSlot.id,
        guestCount: guests,
        notes: notes.trim() || undefined,
        ...(isTravelAgent && contact
          ? {
              guestName: contact.fullName.trim(),
              guestEmail: contact.email.trim(),
              guestPhone: contact.phone.trim(),
              agentMarkupMinor: agentOptions?.agentMarkupMinor ?? 0,
              clientSendConfirmation: agentOptions?.clientSendConfirmation ?? false,
              clientEmailIncludePrice: agentOptions?.clientEmailIncludePrice ?? true,
            }
          : {}),
      });

      removeCartItem(exp.id);

      return result.bookingId;
    } catch (err) {
      setError(toErrorMessage(err, "Failed to create booking."));
      return null;
    } finally {
      setBusy(false);
    }
  }, [
    agentOptions,
    contact,
    exp.id,
    guests,
    isLiveExperience,
    isTravelAgent,
    notes,
    paymentMethod,
    selectedSlot,
    syncContact,
  ]);

  return {
    step,
    setStep,
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
    setError,
    bookableSlots,
    isLiveExperience,
    sym,
    listSubtotalMinor,
    subtotalMinor,
    gstPercent,
    gstMinor,
    totalMinor,
    agentMarkupMinor,
    submit,
  };
}
