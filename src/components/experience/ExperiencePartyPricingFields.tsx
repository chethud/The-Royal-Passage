import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { ExperiencePartyKind } from "@/lib/experience-party-pricing";
import { cn } from "@/lib/utils";

type ExperiencePartyPricingFieldsProps = {
  partyKind: ExperiencePartyKind | null;
  onPartyKindChange: (kind: ExperiencePartyKind) => void;
  priceMajor: number;
  onPriceMajorChange: (value: number) => void;
  maxGuests: number;
  onMaxGuestsChange: (value: number) => void;
  groupMembers: number;
  onGroupMembersChange: (value: number) => void;
  groupTotalMajor: number;
  onGroupTotalMajorChange: (value: number) => void;
  compareAtMajor?: number;
  onCompareAtMajorChange?: (value: number) => void;
  showCompareAt?: boolean;
  disabled?: boolean;
  labelClass: string;
  inputClass: string;
  numberInputClass: string;
  hintClass: string;
  optionClass?: string;
  optionActiveClass?: string;
};

export function ExperiencePartyPricingFields({
  partyKind,
  onPartyKindChange,
  priceMajor,
  onPriceMajorChange,
  maxGuests,
  onMaxGuestsChange,
  groupMembers,
  onGroupMembersChange,
  groupTotalMajor,
  onGroupTotalMajorChange,
  compareAtMajor = 0,
  onCompareAtMajorChange,
  showCompareAt = false,
  disabled = false,
  labelClass,
  inputClass,
  numberInputClass,
  hintClass,
  optionClass = "border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] text-[#2A0000]",
  optionActiveClass = "border-[#4A0000] bg-[rgb(74_0_0/0.08)] text-[#2A0000]",
}: ExperiencePartyPricingFieldsProps) {
  return (
    <>
      <fieldset className="sm:col-span-2">
        <legend className={cn("eyebrow mb-2", labelClass)}>Is this solo or a group?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { kind: "solo" as const, title: "Solo", hint: "Guests book individually. Price is per person." },
              { kind: "group" as const, title: "Group", hint: "Booked together. Set member count and a total group price." },
            ] as const
          ).map((option) => {
            const active = partyKind === option.kind;
            return (
              <label
                key={option.kind}
                className={cn(
                  "cursor-pointer rounded-sm border px-4 py-3 text-sm transition-colors",
                  active ? optionActiveClass : optionClass,
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="radio"
                  name="experience-party-kind"
                  value={option.kind}
                  checked={active}
                  disabled={disabled}
                  onChange={() => onPartyKindChange(option.kind)}
                  className="sr-only"
                />
                <span className="font-medium">{option.title}</span>
                <span className={cn("mt-1 block text-xs opacity-80")}>{option.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {partyKind === "solo" ? (
        <>
          <label className="text-sm">
            <span className={cn("eyebrow", labelClass)}>Price per person (₹)</span>
            <RupeeAmountInput
              disabled={disabled}
              value={priceMajor}
              onChange={onPriceMajorChange}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className={cn("eyebrow", labelClass)}>Max guests / booking</span>
            <input
              type="number"
              min={1}
              max={50}
              disabled={disabled}
              value={maxGuests}
              onChange={(e) => onMaxGuestsChange(Number(e.target.value))}
              className={numberInputClass}
            />
            <span className={hintClass}>Minimum is 1 for solo bookings.</span>
          </label>
        </>
      ) : null}

      {partyKind === "group" ? (
        <>
          <label className="text-sm">
            <span className={cn("eyebrow", labelClass)}>How many members</span>
            <input
              type="number"
              min={2}
              max={50}
              disabled={disabled}
              value={groupMembers}
              onChange={(e) => onGroupMembersChange(Number(e.target.value))}
              className={numberInputClass}
            />
            <span className={hintClass}>Guests must book this full group size.</span>
          </label>
          <label className="text-sm">
            <span className={cn("eyebrow", labelClass)}>Total group price (₹)</span>
            <RupeeAmountInput
              disabled={disabled}
              value={groupTotalMajor}
              onChange={onGroupTotalMajorChange}
              className={inputClass}
            />
          </label>
        </>
      ) : null}

      {showCompareAt && partyKind ? (
        <label className="text-sm">
          <span className={cn("eyebrow", labelClass)}>
            {partyKind === "group" ? "Original group price / was (₹)" : "Original price / was (₹)"}
          </span>
          <RupeeAmountInput
            disabled={disabled}
            value={compareAtMajor}
            onChange={onCompareAtMajorChange ?? (() => {})}
            className={inputClass}
          />
          <span className={hintClass}>
            Optional. Leave blank for no offer. Must be higher than the selling price.
          </span>
        </label>
      ) : null}
    </>
  );
}
