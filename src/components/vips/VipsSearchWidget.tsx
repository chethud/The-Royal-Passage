import { Minus, Plus } from "lucide-react";
import { ExperiencesSearchBar } from "@/components/experiences/ExperiencesSearchBar";
import {
  defaultVipDates,
  minVipTravelFromDate,
  VIP_BOOKING_POLICY_SHORT,
  VIP_CITY,
  type VipBrowseSearch,
} from "@/lib/vip-filters";

export type VipSearchValues = Required<Pick<VipBrowseSearch, "checkIn" | "checkOut" | "guests">> &
  Pick<VipBrowseSearch, "q">;

type VipsSearchWidgetProps = {
  values: VipSearchValues;
  onChange: (patch: Partial<VipSearchValues>) => void;
  onSubmit: () => void;
  className?: string;
  submitLabel?: string;
};

export function createDefaultVipSearchValues(
  overrides?: Partial<VipSearchValues>,
): VipSearchValues {
  const defaults = defaultVipDates();
  return {
    q: "",
    checkIn: defaults.checkIn,
    checkOut: defaults.checkOut,
    guests: 2,
    ...overrides,
  };
}

export function vipSearchFromBrowse(search: VipBrowseSearch): VipSearchValues {
  const defaults = createDefaultVipSearchValues();
  return {
    q: search.q ?? defaults.q,
    checkIn: search.checkIn ?? defaults.checkIn,
    checkOut: search.checkOut ?? defaults.checkOut,
    guests: search.guests ?? defaults.guests,
  };
}

export function VipsSearchWidget({
  values,
  onChange,
  onSubmit,
  className = "",
  submitLabel = "Search",
}: VipsSearchWidgetProps) {
  const earliestTravelFrom = minVipTravelFromDate();

  return (
    <form
      className={`rounded-md border border-[rgb(200_162_90/0.35)] bg-[rgb(255_255_255/0.96)] p-3 shadow-[0_16px_48px_-24px_rgb(0_0_0/0.55)] sm:p-5 ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))_auto] lg:items-end">
        <label className="col-span-2 block lg:col-span-1">
          <span className="eyebrow mb-1.5 block text-[0.58rem] text-[#4A0000]/70 sm:mb-2">
            Package
          </span>
          <ExperiencesSearchBar
            value={values.q ?? ""}
            onChange={(q) => onChange({ q })}
            placeholder={`Search packages in ${VIP_CITY}…`}
            className="w-full"
          />
          <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.14em] text-[#4A0000]/55 sm:mt-1.5">
            {VIP_BOOKING_POLICY_SHORT}
          </span>
        </label>

        <label className="block min-w-0">
          <span className="eyebrow mb-1.5 block text-[0.58rem] text-[#4A0000]/70 sm:mb-2">
            Travel from
          </span>
          <input
            type="date"
            min={earliestTravelFrom}
            required
            value={values.checkIn}
            onChange={(event) => onChange({ checkIn: event.target.value })}
            className="w-full min-w-0 rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-2 py-2.5 text-base text-[#3A0000] focus:border-[#4A0000]/35 focus:outline-none sm:px-3 sm:py-3 sm:text-sm"
          />
        </label>

        <label className="block min-w-0">
          <span className="eyebrow mb-1.5 block text-[0.58rem] text-[#4A0000]/70 sm:mb-2">
            Travel to
          </span>
          <input
            type="date"
            min={values.checkIn || earliestTravelFrom}
            required
            value={values.checkOut}
            onChange={(event) => onChange({ checkOut: event.target.value })}
            className="w-full min-w-0 rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-2 py-2.5 text-base text-[#3A0000] focus:border-[#4A0000]/35 focus:outline-none sm:px-3 sm:py-3 sm:text-sm"
          />
        </label>

        <div className="col-span-2 block sm:col-span-1">
          <span className="eyebrow mb-1.5 block text-[0.58rem] text-[#4A0000]/70 sm:mb-2">Guests</span>
          <div className="flex h-[42px] items-center justify-between rounded-sm border border-[rgb(74_0_0/0.14)] bg-white px-2 sm:h-[46px] sm:px-3">
            <button
              type="button"
              aria-label="Decrease guests"
              disabled={values.guests <= 1}
              onClick={() => onChange({ guests: Math.max(1, values.guests - 1) })}
              className="inline-flex h-9 w-9 items-center justify-center text-[#4A0000]/75 transition-colors hover:text-[#4A0000] disabled:opacity-35 sm:h-8 sm:w-8"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-display text-xl text-[#4A0000]">{values.guests}</span>
            <button
              type="button"
              aria-label="Increase guests"
              disabled={values.guests >= 12}
              onClick={() => onChange({ guests: Math.min(12, values.guests + 1) })}
              className="inline-flex h-9 w-9 items-center justify-center text-[#4A0000]/75 transition-colors hover:text-[#4A0000] disabled:opacity-35 sm:h-8 sm:w-8"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="luxury-btn-sm luxury-btn-primary col-span-2 w-full py-3.5 sm:col-span-1 lg:col-span-1 lg:w-auto lg:min-w-[9.5rem]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
