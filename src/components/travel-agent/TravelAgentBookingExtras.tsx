import { useEffect, useState } from "react";
import { PercentAmountInput } from "@/components/host/PercentAmountInput";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import { formatMoney } from "@/lib/money";
import { markupFromPercent, markupPercentOf } from "@/lib/travel-agent-pricing";
import { cn } from "@/lib/utils";

export type TravelAgentBookingOptions = {
  agentMarkupMinor: number;
  clientSendConfirmation: boolean;
  clientEmailIncludePrice: boolean;
};

export const DEFAULT_TRAVEL_AGENT_BOOKING_OPTIONS: TravelAgentBookingOptions = {
  agentMarkupMinor: 0,
  clientSendConfirmation: false,
  clientEmailIncludePrice: true,
};

type MarkupMode = "fixed" | "percent";

const inputClassName =
  "mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/60 px-3 py-2 text-sm";

type TravelAgentMarkupControlsProps = {
  markupMajor: number;
  onMarkupMajorChange: (value: number) => void;
  agentCostMinor?: number;
  currencySymbol?: string;
  /** compact = inputs only (for summary sidebar); full = includes pricing breakdown */
  variant?: "compact" | "full";
  className?: string;
};

export function TravelAgentMarkupControls({
  markupMajor,
  onMarkupMajorChange,
  agentCostMinor = 0,
  currencySymbol = "₹",
  variant = "full",
  className,
}: TravelAgentMarkupControlsProps) {
  const [markupMode, setMarkupMode] = useState<MarkupMode>("fixed");
  const [markupPercent, setMarkupPercent] = useState(0);

  const markupMinor = Math.round(Math.max(0, markupMajor) * 100);
  const customerTotalMinor = agentCostMinor + markupMinor;
  const hasPricing = agentCostMinor > 0;
  const effectivePercent = markupPercentOf(agentCostMinor, markupMinor);

  useEffect(() => {
    if (markupMode !== "percent") return;
    onMarkupMajorChange(markupFromPercent(agentCostMinor, markupPercent) / 100);
  }, [agentCostMinor, markupMode, markupPercent, onMarkupMajorChange]);

  const switchMode = (mode: MarkupMode) => {
    if (mode === markupMode) return;
    if (mode === "percent") {
      setMarkupPercent(markupPercentOf(agentCostMinor, markupMinor));
    }
    setMarkupMode(mode);
  };

  if (!hasPricing) {
    return (
      <p className={cn("text-xs luxury-panel-body opacity-80", className)}>
        Select dates and guests to set your markup.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">
          Add your markup
        </p>
        <p className="mt-1 text-xs luxury-panel-body opacity-80">
          Set how much extra you charge your customer on top of your agent rate.
        </p>
      </div>

      <div className="inline-flex rounded-sm border border-[rgb(74_0_0/0.15)] bg-white/50 p-0.5">
        {(["fixed", "percent"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => switchMode(mode)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] transition-colors",
              markupMode === mode
                ? "bg-[#4A0000] text-white"
                : "text-[#4A0000]/70 hover:text-[#4A0000]",
            )}
          >
            {mode === "fixed" ? "Fixed ₹" : "Percent %"}
          </button>
        ))}
      </div>

      {markupMode === "fixed" ? (
        <label className="block">
          <span className="text-xs luxury-panel-body opacity-80">Extra amount (₹)</span>
          <RupeeAmountInput
            className={inputClassName}
            value={markupMajor}
            onChange={onMarkupMajorChange}
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-xs luxury-panel-body opacity-80">Markup on your agent rate (%)</span>
          <div className="relative mt-1">
            <PercentAmountInput
              className={cn(inputClassName, "mt-0 pr-8")}
              value={markupPercent}
              onChange={setMarkupPercent}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#4A0000]/55">
              %
            </span>
          </div>
          {markupPercent > 0 ? (
            <p className="mt-1 text-xs luxury-panel-body opacity-80">
              = {formatMoney(markupMinor, currencySymbol)} on this booking
            </p>
          ) : null}
        </label>
      )}

      {variant === "full" ? (
        <dl className="space-y-2 rounded-sm border border-[rgb(74_0_0/0.1)] bg-white/40 px-3 py-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="luxury-panel-body">Your agent rate</dt>
            <dd className="font-medium tabular-nums luxury-panel-heading">
              {formatMoney(agentCostMinor, currencySymbol)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="luxury-panel-body">
              Your markup
              {markupMinor > 0 && effectivePercent > 0 ? (
                <span className="ml-1 text-xs opacity-70">(+{effectivePercent}%)</span>
              ) : null}
            </dt>
            <dd className="font-medium tabular-nums text-[#8B6914]">
              +{formatMoney(markupMinor, currencySymbol)}
            </dd>
          </div>
          <div className="hairline !my-2" />
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">
              Customer price
            </dt>
            <dd className="font-display text-lg tabular-nums luxury-panel-heading">
              {formatMoney(customerTotalMinor, currencySymbol)}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

type TravelAgentClientEmailOptionsProps = {
  clientSendConfirmation: boolean;
  onClientSendConfirmationChange: (value: boolean) => void;
  clientEmailIncludePrice: boolean;
  onClientEmailIncludePriceChange: (value: boolean) => void;
  customerTotalMinor: number;
  currencySymbol?: string;
  /** Unique radio group name when multiple forms may mount. */
  groupName?: string;
};

export function TravelAgentClientEmailOptions({
  clientSendConfirmation,
  onClientSendConfirmationChange,
  clientEmailIncludePrice,
  onClientEmailIncludePriceChange,
  customerTotalMinor,
  currencySymbol = "₹",
  groupName = "client-email-price",
}: TravelAgentClientEmailOptionsProps) {
  const priceLabel = formatMoney(customerTotalMinor, currencySymbol);

  return (
    <div className="mt-6 space-y-4 rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-4 sm:mt-8">
      <div>
        <p className="eyebrow luxury-panel-label">Send email to customer</p>
        <p className="mt-1 text-xs luxury-panel-body opacity-80">
          Choose whether your customer receives a booking confirmation, and if the email should
          include the price you charge them.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Customer confirmation email</legend>

        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-transparent px-1 py-1 hover:border-[rgb(74_0_0/0.08)]">
          <input
            type="radio"
            name={groupName}
            className="mt-1"
            checked={!clientSendConfirmation}
            onChange={() => onClientSendConfirmationChange(false)}
          />
          <span className="text-sm luxury-panel-body">
            <span className="font-medium">Do not send</span>
            <span className="mt-0.5 block text-xs opacity-80">
              Only you receive the booking confirmation.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-transparent px-1 py-1 hover:border-[rgb(74_0_0/0.08)]">
          <input
            type="radio"
            name={groupName}
            className="mt-1"
            checked={clientSendConfirmation && clientEmailIncludePrice}
            onChange={() => {
              onClientSendConfirmationChange(true);
              onClientEmailIncludePriceChange(true);
            }}
          />
          <span className="text-sm luxury-panel-body">
            <span className="font-medium">Send with price</span>
            <span className="mt-0.5 block text-xs opacity-80">
              Customer email includes the total you charge: {priceLabel}
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-transparent px-1 py-1 hover:border-[rgb(74_0_0/0.08)]">
          <input
            type="radio"
            name={groupName}
            className="mt-1"
            checked={clientSendConfirmation && !clientEmailIncludePrice}
            onChange={() => {
              onClientSendConfirmationChange(true);
              onClientEmailIncludePriceChange(false);
            }}
          />
          <span className="text-sm luxury-panel-body">
            <span className="font-medium">Send without price</span>
            <span className="mt-0.5 block text-xs opacity-80">
              Customer gets stay details and dates only — no amount shown.
            </span>
          </span>
        </label>
      </fieldset>
    </div>
  );
}

/** @deprecated Use TravelAgentMarkupControls + TravelAgentClientEmailOptions separately. */
export function TravelAgentBookingExtras({
  markupMajor,
  onMarkupMajorChange,
  agentCostMinor = 0,
  currencySymbol = "₹",
  clientSendConfirmation,
  onClientSendConfirmationChange,
  clientEmailIncludePrice,
  onClientEmailIncludePriceChange,
}: {
  markupMajor: number;
  onMarkupMajorChange: (value: number) => void;
  agentCostMinor?: number;
  currencySymbol?: string;
  clientSendConfirmation: boolean;
  onClientSendConfirmationChange: (value: boolean) => void;
  clientEmailIncludePrice: boolean;
  onClientEmailIncludePriceChange: (value: boolean) => void;
}) {
  const customerTotalMinor = agentCostMinor + Math.round(Math.max(0, markupMajor) * 100);

  return (
    <div className="space-y-4 rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-4">
      <TravelAgentMarkupControls
        markupMajor={markupMajor}
        onMarkupMajorChange={onMarkupMajorChange}
        agentCostMinor={agentCostMinor}
        currencySymbol={currencySymbol}
        variant="full"
      />
      <TravelAgentClientEmailOptions
        clientSendConfirmation={clientSendConfirmation}
        onClientSendConfirmationChange={onClientSendConfirmationChange}
        clientEmailIncludePrice={clientEmailIncludePrice}
        onClientEmailIncludePriceChange={onClientEmailIncludePriceChange}
        customerTotalMinor={customerTotalMinor}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}

export function travelAgentOptionsToPayload(
  markupMajor: number,
  clientSendConfirmation: boolean,
  clientEmailIncludePrice: boolean,
): TravelAgentBookingOptions {
  return {
    agentMarkupMinor: Math.round(Math.max(0, markupMajor) * 100),
    clientSendConfirmation,
    clientEmailIncludePrice: clientSendConfirmation ? clientEmailIncludePrice : true,
  };
}
