import { Minus, Plus, Search } from "lucide-react";
import { defaultHomestayDates, type HomestayBrowseSearch } from "@/lib/homestay-filters";

export type HomestaySearchValues = Required<
  Pick<HomestayBrowseSearch, "checkIn" | "checkOut" | "guests">
> &
  Pick<HomestayBrowseSearch, "q">;

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
  const defaults = defaultHomestayDates();
  return {
    q: "",
    checkIn: defaults.checkIn,
    checkOut: defaults.checkOut,
    guests: 2,
    ...overrides,
  };
}

export function homestaySearchFromBrowse(search: HomestayBrowseSearch): HomestaySearchValues {
  const defaults = createDefaultHomestaySearchValues();
  return {
    q: search.q ?? defaults.q,
    checkIn: search.checkIn ?? defaults.checkIn,
    checkOut: search.checkOut ?? defaults.checkOut,
    guests: search.guests ?? defaults.guests,
  };
}

export function HomestaysSearchWidget({
  values,
  onChange,
  onSubmit,
  className = "",
  submitLabel = "Search stays",
}: HomestaysSearchWidgetProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      className={`rounded-md border border-[rgb(200_162_90/0.35)] bg-[rgb(255_255_255/0.96)] p-4 shadow-[0_16px_48px_-24px_rgb(0_0_0/0.55)] sm:p-5 ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))_auto] lg:items-end">
        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="eyebrow mb-2 block text-[0.58rem] text-[#4A0000]/70">Location</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A0000]/55" />
            <input
              type="search"
              value={values.q ?? ""}
              onChange={(event) => onChange({ q: event.target.value })}
              placeholder="City or property name…"
              className="w-full rounded-sm border border-[rgb(74_0_0/0.14)] bg-white py-3 pl-10 pr-3 text-sm text-[#3A0000] placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/35 focus:outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="eyebrow mb-2 block text-[0.58rem] text-[#4A0000]/70">Check-in</span>
          <input
            type="date"
            min={today}
            value={values.checkIn}
            onChange={(event) => onChange({ checkIn: event.target.value })}
            className="w-full rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-3 py-3 text-sm text-[#3A0000] focus:border-[#4A0000]/35 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-2 block text-[0.58rem] text-[#4A0000]/70">Check-out</span>
          <input
            type="date"
            min={values.checkIn}
            value={values.checkOut}
            onChange={(event) => onChange({ checkOut: event.target.value })}
            className="w-full rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-3 py-3 text-sm text-[#3A0000] focus:border-[#4A0000]/35 focus:outline-none"
          />
        </label>

        <div className="block">
          <span className="eyebrow mb-2 block text-[0.58rem] text-[#4A0000]/70">Guests</span>
          <div className="flex h-[46px] items-center justify-between rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-3">
            <button
              type="button"
              aria-label="Decrease guests"
              disabled={values.guests <= 1}
              onClick={() => onChange({ guests: Math.max(1, values.guests - 1) })}
              className="inline-flex h-8 w-8 items-center justify-center text-[#4A0000]/75 transition-colors hover:text-[#4A0000] disabled:opacity-35"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-display text-xl text-[#4A0000]">{values.guests}</span>
            <button
              type="button"
              aria-label="Increase guests"
              disabled={values.guests >= 12}
              onClick={() => onChange({ guests: Math.min(12, values.guests + 1) })}
              className="inline-flex h-8 w-8 items-center justify-center text-[#4A0000]/75 transition-colors hover:text-[#4A0000] disabled:opacity-35"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="luxury-btn-sm luxury-btn-primary w-full py-3.5 sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-[9.5rem]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
