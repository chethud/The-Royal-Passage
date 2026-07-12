import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HomestayPaymentMethod } from "@/components/homestays/HomestayCashPaymentSelector";
import type { Homestay } from "@/data/homestays";
import { createHomestayBooking } from "@/lib/api/homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import {
  calculateStayTotalMinor,
  getActiveRooms,
  getSelectedRoom,
  maxExtraBeds,
  maxGuestsForSelection,
  maxRoomCount,
  usesPropertyLevelExtraBeds,
} from "@/lib/homestay-room-pricing";
import {
  formatWeekdayWeekendRates,
  weekdayPriceMajor,
  weekendPriceMajor,
} from "@/lib/homestay-day-pricing";
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
    initialRoomCount?: number;
    initialExtraBeds?: number;
  } = {},
) {
  const rooms = getActiveRooms(homestay);
  const defaultRoomId =
    options.initialRoomId ?? (rooms.length === 1 ? rooms[0]?.id : undefined);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState(options.initialCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(options.initialCheckOut ?? "");
  const [guests, setGuests] = useState(options.initialGuests ?? 1);
  const [roomId, setRoomId] = useState<string | undefined>(defaultRoomId);
  const [roomCount, setRoomCount] = useState(options.initialRoomCount ?? 1);
  const [extraBedCount, setExtraBedCount] = useState(options.initialExtraBeds ?? 0);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<HomestayPaymentMethod>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydratedKey = useRef<string>("");

  // Re-apply URL / navigation search when it arrives or changes (e.g. after auth gate).
  useEffect(() => {
    const key = [
      options.initialCheckIn ?? "",
      options.initialCheckOut ?? "",
      options.initialGuests ?? "",
      options.initialRoomId ?? "",
      options.initialRoomCount ?? "",
      options.initialExtraBeds ?? "",
    ].join("|");
    if (!key || key === "|||||") return;
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;

    if (options.initialCheckIn) setCheckIn(options.initialCheckIn);
    if (options.initialCheckOut) setCheckOut(options.initialCheckOut);
    if (options.initialGuests) setGuests(options.initialGuests);
    if (options.initialRoomId) setRoomId(options.initialRoomId);
    if (options.initialRoomCount) setRoomCount(options.initialRoomCount);
    if (options.initialExtraBeds != null) setExtraBedCount(options.initialExtraBeds);
  }, [
    options.initialCheckIn,
    options.initialCheckOut,
    options.initialExtraBeds,
    options.initialGuests,
    options.initialRoomCount,
    options.initialRoomId,
  ]);

  const selectedRoom = useMemo(() => getSelectedRoom(homestay, roomId), [homestay, roomId]);
  const maxRooms = maxRoomCount(selectedRoom);
  const maxExtra = maxExtraBeds(homestay, selectedRoom, roomCount);
  const maxGuests = maxGuestsForSelection(
    homestay,
    selectedRoom,
    roomCount,
    extraBedCount,
  );

  useEffect(() => {
    if (!checkIn) {
      if (checkOut) setCheckOut("");
      return;
    }
    if (!checkOut || checkOut <= checkIn) {
      setCheckOut(addDays(checkIn, 1));
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    setRoomCount((current) => Math.min(Math.max(1, current), maxRooms));
  }, [maxRooms]);

  useEffect(() => {
    setExtraBedCount((current) => Math.min(Math.max(0, current), maxExtra));
  }, [maxExtra]);

  useEffect(() => {
    setGuests((current) => Math.min(Math.max(1, current), Math.max(1, maxGuests)));
  }, [maxGuests]);

  useEffect(() => {
    if (!selectedRoom?.extraBedAvailable && !usesPropertyLevelExtraBeds(homestay, selectedRoom)) {
      setExtraBedCount(0);
    }
  }, [homestay, selectedRoom]);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const pricing = useMemo(
    () =>
      calculateStayTotalMinor(homestay, {
        roomId,
        roomCount: rooms.length ? roomCount : 1,
        extraBedCount: rooms.length ? extraBedCount : 0,
        checkIn,
        checkOut,
      }),
    [homestay, roomId, roomCount, extraBedCount, checkIn, checkOut, rooms.length],
  );
  const sym = homestay.currencySymbol ?? "₹";

  const goNext = useCallback(() => {
    setError(null);
    if (step === 1) {
      if (nights < 1) {
        setError("Select at least one night.");
        return;
      }
      if (rooms.length > 1 && !roomId) {
        setError("Select a room type.");
        return;
      }
    }
    setStep((current) => Math.min(3, current + 1) as 1 | 2 | 3);
  }, [nights, roomId, rooms.length, step]);

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
    if (rooms.length > 1 && !roomId) {
      throw new Error("Select a room type.");
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
        roomId: roomId ?? (rooms.length === 1 ? rooms[0]?.id : undefined),
        checkIn,
        checkOut,
        guestCount: guests,
        roomCount: rooms.length ? roomCount : undefined,
        extraBedCount: rooms.length ? extraBedCount : undefined,
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
  }, [
    checkIn,
    checkOut,
    extraBedCount,
    guests,
    homestay.id,
    nights,
    notes,
    paymentMethod,
    roomCount,
    roomId,
    rooms,
  ]);

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
    roomCount,
    setRoomCount,
    extraBedCount,
    setExtraBedCount,
    selectedRoom,
    maxRooms,
    maxExtra,
    maxGuests,
    notes,
    setNotes,
    paymentMethod,
    setPaymentMethod,
    nights,
    totalMinor: pricing.totalMinor,
    totalLabel: formatMoney(pricing.totalMinor, sym),
    nightlyLabel: formatWeekdayWeekendRates(
      sym,
      weekdayPriceMajor(homestay, selectedRoom),
      weekendPriceMajor(homestay, selectedRoom),
    ),
    extraBedLabel: pricing.extraBedPriceMajor
      ? `${sym}${pricing.extraBedPriceMajor.toLocaleString("en-IN")}`
      : null,
    busy,
    error,
    submit,
  };
}
