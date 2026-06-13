export type BookingListStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "today";

export type BookingPaymentFilter = "all" | "cod-pending" | "collected";

export type BookingDateView = "week" | "all" | "history";

export type BookingListSearch = {
  status?: BookingListStatus;
  payment?: BookingPaymentFilter;
  dateView?: BookingDateView;
};

export function parseBookingListSearch(raw: Record<string, unknown>): BookingListSearch {
  const status = raw.status;
  const payment = raw.payment;
  const dateView = raw.dateView;

  const validStatus = [
    "all",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "today",
  ] as const;
  const validPayment = ["all", "cod-pending", "collected"] as const;
  const validDateView = ["week", "all", "history"] as const;

  return {
    status:
      typeof status === "string" && validStatus.includes(status as BookingListStatus)
        ? (status as BookingListStatus)
        : undefined,
    payment:
      typeof payment === "string" && validPayment.includes(payment as BookingPaymentFilter)
        ? (payment as BookingPaymentFilter)
        : undefined,
    dateView:
      typeof dateView === "string" && validDateView.includes(dateView as BookingDateView)
        ? (dateView as BookingDateView)
        : undefined,
  };
}

export function bookingSearchForStatus(status: BookingListStatus): BookingListSearch {
  return status === "all" ? {} : { status };
}

export function bookingSearchForPayment(payment: BookingPaymentFilter): BookingListSearch {
  return payment === "all" ? {} : { payment };
}

export function bookingSearchForDateView(dateView: BookingDateView): BookingListSearch {
  return dateView === "week" ? {} : { dateView };
}
