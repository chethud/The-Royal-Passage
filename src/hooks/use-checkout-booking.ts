import { useCallback, useEffect, useMemo, useState } from "react";
import type { Experience, Slot } from "@/data/experiences";
import { createBooking } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { fetchGuestProfile } from "@/lib/api/guest";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";
import { useBookingClock } from "@/hooks/use-today-iso-date";
import { guestBookingLimits } from "@/lib/booking-url";
import { removeCartItem } from "@/lib/cart-storage";
import type { PaymentMethod } from "@/components/booking/PaymentMethodSelector";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type UseCheckoutBookingOptions = {
  exp: Experience;
  source: "live" | "static";
  initialSlotId?: string;
  initialGuests?: number;
};

export function useCheckoutBooking({
  exp,
  source,
  initialSlotId,
  initialGuests,
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
  const [profileReady, setProfileReady] = useState(false);

  const isLiveExperience = source === "live";
  const sym = exp.currencySymbol ?? "₹";
  const totalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;

  useEffect(() => {
    if (!selectedSlot) return;
    const { min, max } = guestBookingLimits(exp, selectedSlot.available);
    setGuests((current) => Math.min(Math.max(min, current), max));
  }, [exp, selectedSlot]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (!isApiConfigured()) {
          if (!cancelled) setProfileReady(true);
          return;
        }
        const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          await fetchGuestProfile(token);
        }
      } catch {
        // createBooking will surface clearer errors on submit.
      } finally {
        if (!cancelled) setProfileReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

      const result = await createBooking(token, {
        slotId: selectedSlot.id,
        guestCount: guests,
        notes: notes.trim() || undefined,
      });

      removeCartItem(exp.id);

      return result.bookingId;
    } catch (err) {
      setError(toErrorMessage(err, "Failed to create booking."));
      return null;
    } finally {
      setBusy(false);
    }
  }, [exp.id, guests, isLiveExperience, notes, paymentMethod, selectedSlot]);

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
    profileReady,
    bookableSlots,
    isLiveExperience,
    sym,
    totalMinor,
    submit,
  };
}
