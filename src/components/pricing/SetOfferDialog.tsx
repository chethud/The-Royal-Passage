import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import { formatMoney } from "@/lib/money";
import { offerPercentOff } from "@/components/pricing/OfferPrice";

type SetOfferDialogProps = {
  open: boolean;
  busy: boolean;
  title: string;
  subtitle?: string;
  currencySymbol: string;
  sellingPriceMinor: number;
  compareAtMinor?: number | null;
  onClose: () => void;
  onSave: (payload: {
    sellingPriceMinor: number;
    compareAtPriceMinor: number | null;
  }) => Promise<void>;
};

export function SetOfferDialog({
  open,
  busy,
  title,
  subtitle,
  currencySymbol,
  sellingPriceMinor,
  compareAtMinor,
  onClose,
  onSave,
}: SetOfferDialogProps) {
  const hasOffer =
    compareAtMinor != null && compareAtMinor > sellingPriceMinor && sellingPriceMinor > 0;

  const normalPriceMinor = hasOffer ? compareAtMinor! : sellingPriceMinor;

  const [discountedMajor, setDiscountedMajor] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDiscountedMajor(hasOffer ? Math.round(sellingPriceMinor / 100) : 0);
    setError(null);
  }, [open, hasOffer, sellingPriceMinor]);

  const previewPercent = useMemo(() => {
    if (discountedMajor <= 0 || normalPriceMinor <= 0) return null;
    return offerPercentOff(discountedMajor, Math.round(normalPriceMinor / 100));
  }, [discountedMajor, normalPriceMinor]);

  const canSubmit = discountedMajor > 0 && discountedMajor < Math.round(normalPriceMinor / 100);

  const handleSave = async () => {
    const normalMajor = Math.round(normalPriceMinor / 100);

    if (discountedMajor <= 0) {
      setError("Enter a discounted price.");
      return;
    }
    if (discountedMajor >= normalMajor) {
      setError("Discounted price must be lower than the normal price.");
      return;
    }

    setError(null);
    try {
      await onSave({
        sellingPriceMinor: discountedMajor * 100,
        compareAtPriceMinor: normalPriceMinor,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save offer.");
    }
  };

  const handleRemoveOffer = async () => {
    setError(null);
    try {
      await onSave({
        sellingPriceMinor: normalPriceMinor,
        compareAtPriceMinor: null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove offer.");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.7)] px-3 py-2 text-sm text-[#2A0000] placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <DialogContent className="max-w-md border-[rgb(74_0_0/0.22)] bg-[#FEF9E7] text-[#2A0000] sm:rounded-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#2A0000]">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#2A0000]/78">
            {subtitle ??
              "Guests see the normal price struck through and pay the discounted price you set."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-sm border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.45)] px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]/75">
              Normal price
            </p>
            <p className="mt-1 font-display text-2xl text-[#2A0000]">
              {formatMoney(normalPriceMinor, currencySymbol)}
            </p>
          </div>

          <label className="block text-sm">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]/75">
              Discounted price <span className="text-[#8B1A1A]">*</span>
            </span>
            <RupeeAmountInput
              value={discountedMajor}
              onChange={setDiscountedMajor}
              disabled={busy}
              className={inputClass}
              placeholder="Enter discounted price"
            />
            {previewPercent != null && previewPercent > 0 ? (
              <p className="mt-1 text-xs font-medium text-[#8B1E1E]">{previewPercent}% off</p>
            ) : (
              <p className="mt-1 text-xs text-[#4A0000]/55">
                Must be lower than {formatMoney(normalPriceMinor, currencySymbol)}.
              </p>
            )}
          </label>
        </div>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          {hasOffer ? (
            <button
              type="button"
              className="luxury-btn-sm luxury-btn-panel-outline w-full border-destructive/40 text-destructive sm:mr-auto sm:w-auto"
              disabled={busy}
              onClick={() => void handleRemoveOffer()}
            >
              Remove offer
            </button>
          ) : null}
          <button
            type="button"
            className="luxury-btn-sm luxury-btn-panel-outline w-full sm:w-auto"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="luxury-btn-sm luxury-btn-primary w-full sm:w-auto"
            disabled={busy || !canSubmit}
            onClick={() => void handleSave()}
          >
            {busy ? "Saving…" : "Save offer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
