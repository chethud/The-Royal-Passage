import { Minus, Plus } from "lucide-react";
import { ExperiencesSearchBar } from "@/components/experiences/ExperiencesSearchBar";
import { HOMESTAY_CITY, type HomestayBrowseSearch } from "@/lib/homestay-filters";

export type HomestaySearchValues = {
  q?: string;
  /** Empty until the guest picks a date. */
  checkIn: string;
  checkOut: string;
  /** Empty until the guest picks a count. */
  guests?: number;
};

type HomestaysSearchWidgetProps = {
  values: HomestaySearchValues;
  onChange: (patch: Partial<HomestaySearchValues>) => void;
  onSubmit: () => void;
  className?: string;
  submitLabel?: string;
};

export function createDefaultHomestaySearchValues(
  overrides?: Partial<HomestaySearchValues>,
): HomestaySearchValues {
  return {
    q: "",
    checkIn: "",
    checkOut: "",
    ...overrides,
  };
}

export function homestaySearchFromBrowse(search: HomestayBrowseSearch): HomestaySearchValues {
  return {
    q: search.q ?? "",
    checkIn: search.checkIn ?? "",
    checkOut: search.checkOut ?? "",
    guests: search.guests,
  };
}

const dateFieldClass =
  "w-full min-w-0 rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-1.5 py-1.5 text-[0.72rem] leading-tight text-[#3A0000] focus:border-[#4A0000]/35 focus:outline-none sm:px-2.5 sm:py-2 sm:text-sm";

export function HomestaysSearchWidget({
  values,
  onChange,
  onSubmit,
  className = "",
  submitLabel = "Search stays",
}: HomestaysSearchWidgetProps) {
  const today = new Date().toISOString().slice(0, 10);
  const checkOutMin = values.checkIn || today;
  const guestCount = values.guests;
  const hasGuests = guestCount != null && guestCount > 0;

  const handleCheckInChange = (next: string) => {
    const patch: Partial<HomestaySearchValues> = { checkIn: next };
    if (next && values.checkOut && values.checkOut <= next) {
      patch.checkOut = "";
    }
    onChange(patch);
  };

  return (
    <form
      className={`rounded-md border border-[rgb(200_162_90/0.35)] bg-[rgb(255_255_255/0.96)] p-2.5 shadow-[0_16px_48px_-24px_rgb(0_0_0/0.55)] sm:p-4 ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.85fr))_auto] lg:items-end lg:gap-3">
        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="eyebrow mb-1 block text-[0.55rem] text-[#4A0000]/70 sm:mb-1.5 sm:text-[0.58rem]">
            Property
          </span>
          <ExperiencesSearchBar
            value={values.q ?? ""}
            onChange={(q) => onChange({ q })}
            placeholder={`Search in ${HOMESTAY_CITY}…`}
            className="w-full"
          />
          <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.14em] text-[#4A0000]/55">
            {HOMESTAY_CITY} only
          </span>
        </label>

        <label className="block min-w-0">
          <span className="eyebrow mb-1 block text-[0.55rem] text-[#4A0000]/70 sm:mb-1.5 sm:text-[0.58rem]">
            Check-in
          </span>
          <input
            type="date"
            min={today}
            value={values.checkIn}
            onChange={(event) => handleCheckInChange(event.target.value)}
            className={dateFieldClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="eyebrow mb-1 block text-[0.55rem] text-[#4A0000]/70 sm:mb-1.5 sm:text-[0.58rem]">
            Check-out
          </span>
          <input
            type="date"
            min={checkOutMin}
            value={values.checkOut}
            onChange={(event) => onChange({ checkOut: event.target.value })}
            className={dateFieldClass}
          />
        </label>

        <div className="block sm:col-span-1">
          <span className="eyebrow mb-1 block text-[0.55rem] text-[#4A0000]/70 sm:mb-1.5 sm:text-[0.58rem]">
            Guests
          </span>
          <div className="flex h-8 items-center justify-between rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-1.5 sm:h-9 sm:px-2.5">
            <button
              type="button"
              aria-label="Decrease guests"
              disabled={!hasGuests}
              onClick={() =>
                onChange({
                  guests: guestCount === 1 ? undefined : Math.max(1, (guestCount ?? 1) - 1),
                })
              }
              className="inline-flex h-7 w-7 items-center justify-center text-[#4A0000]/75 transition-colors hover:text-[#4A0000] disabled:opacity-35 sm:h-8 sm:w-8"
            >
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="font-display text-base text-[#4A0000] sm:text-lg">
              {hasGuests ? guestCount : "—"}
            </span>
            <button
              type="button"
              aria-label="Increase guests"
              disabled={hasGuests && guestCount >= 12}
              onClick={() =>
                onChange({
                  guests: hasGuests ? Math.min(12, guestCount + 1) : 1,
                })
              }
              className="inline-flex h-7 w-7 items-center justify-center text-[#4A0000]/75 transition-colors hover:text-[#4A0000] disabled:opacity-35 sm:h-8 sm:w-8"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="luxury-btn-sm luxury-btn-primary w-full py-2.5 text-[0.62rem] sm:col-span-1 sm:py-3 lg:col-span-1 lg:w-auto lg:min-w-[8.5rem]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
