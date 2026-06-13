export type BookingListStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "today";

export type BookingPaymentFilter = "all" | "cod-pending" | "collected";

export type BookingListSearch = {
  status?: BookingListStatus;
  payment?: BookingPaymentFilter;
};

export function parseBookingListSearch(raw: Record<string, unknown>): BookingListSearch {
  const status = raw.status;
  const payment = raw.payment;

  const validStatus = [
    "all",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "today",
  ] as const;
  const validPayment = ["all", "cod-pending", "collected"] as const;

  return {
    status:
      typeof status === "string" && validStatus.includes(status as BookingListStatus)
        ? (status as BookingListStatus)
        : undefined,
    payment:
      typeof payment === "string" && validPayment.includes(payment as BookingPaymentFilter)
        ? (payment as BookingPaymentFilter)
        : undefined,
  };
}

export function bookingSearchForStatus(status: BookingListStatus): BookingListSearch {
  return status === "all" ? {} : { status };
}

export function bookingSearchForPayment(payment: BookingPaymentFilter): BookingListSearch {
  return payment === "all" ? {} : { payment };
}
