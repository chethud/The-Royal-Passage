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

type TravelAgentBookingExtrasProps = {
  markupMajor: number;
  onMarkupMajorChange: (value: number) => void;
  clientSendConfirmation: boolean;
  onClientSendConfirmationChange: (value: boolean) => void;
  clientEmailIncludePrice: boolean;
  onClientEmailIncludePriceChange: (value: boolean) => void;
  discountPercent?: number | null;
};

export function TravelAgentBookingExtras({
  markupMajor,
  onMarkupMajorChange,
  clientSendConfirmation,
  onClientSendConfirmationChange,
  clientEmailIncludePrice,
  onClientEmailIncludePriceChange,
  discountPercent,
}: TravelAgentBookingExtrasProps) {
  return (
    <div className="space-y-4 rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-4">
      <div>
        <p className="eyebrow luxury-panel-label">Travel agent booking</p>
        {discountPercent != null && discountPercent > 0 ? (
          <p className="mt-1 text-xs luxury-panel-body">
            Your negotiated discount: {discountPercent}% off platform rates (before markup).
          </p>
        ) : null}
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">
          Your markup (₹)
        </span>
        <input
          type="number"
          min={0}
          step={1}
          className="mt-1 w-full max-w-xs rounded-sm border border-[rgb(74_0_0/0.2)] bg-white/60 px-3 py-2 text-sm"
          value={markupMajor || ""}
          onChange={(e) => onMarkupMajorChange(Math.max(0, Number(e.target.value) || 0))}
        />
        <p className="mt-1 text-xs luxury-panel-body opacity-80">
          Optional extra amount added to the client total. You always receive a confirmation email with full pricing.
        </p>
      </label>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1"
          checked={clientSendConfirmation}
          onChange={(e) => onClientSendConfirmationChange(e.target.checked)}
        />
        <span className="text-sm luxury-panel-body">Send confirmation email to the customer</span>
      </label>

      {clientSendConfirmation ? (
        <fieldset className="space-y-2 pl-1">
          <legend className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">
            Customer email pricing
          </legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="client-email-price"
              checked={clientEmailIncludePrice}
              onChange={() => onClientEmailIncludePriceChange(true)}
            />
            <span className="text-sm luxury-panel-body">Include price in customer email</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="client-email-price"
              checked={!clientEmailIncludePrice}
              onChange={() => onClientEmailIncludePriceChange(false)}
            />
            <span className="text-sm luxury-panel-body">Send confirmation without price</span>
          </label>
        </fieldset>
      ) : null}
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
