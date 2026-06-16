import { useCallback, useEffect, useMemo, useState } from "react";
import type { HomestayPaymentMethod } from "@/components/homestays/HomestayCashPaymentSelector";
import type { Homestay } from "@/data/homestays";
import { createHomestayBooking } from "@/lib/api/homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export function useHomestayCheckout(
  homestay: Homestay,
  options: {
    initialCheckIn?: string;
    initialCheckOut?: string;
    initialGuests?: number;
    initialRoomId?: string;
  },
) {
  const today = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState(options.initialCheckIn ?? today);
  const [checkOut, setCheckOut] = useState(options.initialCheckOut ?? addDays(today, 2));
  const [guests, setGuests] = useState(options.initialGuests ?? 1);
  const [roomId, setRoomId] = useState<string | undefined>(options.initialRoomId);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<HomestayPaymentMethod>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checkOut <= checkIn) {
      setCheckOut(addDays(checkIn, 1));
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    setGuests((current) => Math.min(Math.max(1, current), homestay.maxGuests));
  }, [homestay.maxGuests]);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const nightlyRate = homestay.pricePerNight;
  const totalMinor = nightlyRate * 100 * Math.max(nights, 0);
  const sym = homestay.currencySymbol ?? "₹";

  const goNext = useCallback(() => {
    setError(null);
    if (step === 1 && nights < 1) {
      setError("Select at least one night.");
      return;
    }
    setStep((current) => Math.min(3, current + 1) as 1 | 2 | 3);
  }, [nights, step]);

  const goBack = useCallback(() => {
    setError(null);
    setStep((current) => Math.max(1, current - 1) as 1 | 2 | 3);
  }, []);

  const submit = useCallback(async () => {
    if (!isApiConfigured()) {
      throw new Error("Booking API is not configured for this deployment.");
    }
    if (nights < 1) {
      throw new Error("Select at least one night.");
    }
    if (paymentMethod !== "cod") {
      throw new Error("Only cash payment at the homestay is available.");
    }
    const session = await getSupabaseBrowser().auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw new Error("Sign in required.");

    setBusy(true);
    setError(null);
    try {
      const result = await createHomestayBooking(token, {
        homestayId: homestay.id,
        roomId,
        checkIn,
        checkOut,
        guestCount: guests,
        notes: notes.trim() || undefined,
      });
      return result.bookingId;
    } catch (err) {
      const message = toErrorMessage(err, "Failed to submit stay request.");
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, [checkIn, checkOut, guests, homestay.id, nights, notes, paymentMethod, roomId]);

  return {
    step,
    goNext,
    goBack,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    roomId,
    setRoomId,
    notes,
    setNotes,
    paymentMethod,
    setPaymentMethod,
    nights,
    totalMinor,
    totalLabel: formatMoney(totalMinor, sym),
    nightlyLabel: `${sym}${nightlyRate.toLocaleString("en-IN")}`,
    busy,
    error,
    submit,
  };
}
