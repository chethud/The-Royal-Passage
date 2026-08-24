import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { normalizeTenDigitPhone, sanitizeTenDigitPhoneInput } from "@/lib/phone";

export type BookingDecisionPayload = {
  decisionName: string;
  decisionPhone: string;
  rejectionReason?: string;
};

type BookingDecisionDialogProps = {
  open: boolean;
  mode: "accept" | "reject";
  title: string;
  description: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (payload: BookingDecisionPayload) => Promise<void>;
};

const NAME_RE = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeNameInput(value: string) {
  return value.replace(/[^A-Za-z ]/g, "");
}

export function BookingDecisionDialog({
  open,
  mode,
  title,
  description,
  busy,
  onClose,
  onConfirm,
}: BookingDecisionDialogProps) {
  const [decisionName, setDecisionName] = useState("");
  const [decisionPhone, setDecisionPhone] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDecisionName("");
    setDecisionPhone("");
    setRejectionReason("");
    setError(null);
  }, [open, mode]);

  const canSubmit = useMemo(() => {
    const name = normalizeName(decisionName);
    const phone = normalizeTenDigitPhone(decisionPhone);
    if (!name || !NAME_RE.test(name)) return false;
    if (!phone) return false;
    if (mode === "reject" && !rejectionReason.trim()) return false;
    return true;
  }, [decisionName, decisionPhone, rejectionReason, mode]);

  const handleConfirm = async () => {
    const name = normalizeName(decisionName);
    const phone = normalizeTenDigitPhone(decisionPhone);
    const reason = rejectionReason.trim();

    if (!name) {
      setError("Name is required.");
      return;
    }
    if (!NAME_RE.test(name)) {
      setError("Name may only contain alphabetic letters and spaces.");
      return;
    }
    if (!phone) {
      setError("Mobile number is required (exactly 10 digits).");
      return;
    }
    if (mode === "reject" && !reason) {
      setError("Rejection reason is required.");
      return;
    }

    setError(null);
    try {
      await onConfirm({
        decisionName: name,
        decisionPhone: `+91${phone}`,
        rejectionReason: mode === "reject" ? reason : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete this action.");
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
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]/75">
              Your name <span className="text-[#8B1A1A]">*</span>
            </span>
            <input
              value={decisionName}
              onChange={(e) => setDecisionName(sanitizeNameInput(e.target.value))}
              className={inputClass}
              placeholder="Full name"
              disabled={busy}
              autoComplete="name"
              inputMode="text"
              maxLength={120}
              required
              aria-required="true"
            />
          </label>
          <label className="block text-sm">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]/75">
              Mobile number <span className="text-[#8B1A1A]">*</span>
            </span>
            <div className="mt-1 flex overflow-hidden rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.7)] focus-within:border-[#4A0000]/50">
              <span
                className="inline-flex shrink-0 items-center border-r border-[rgb(74_0_0/0.15)] bg-[rgb(74_0_0/0.06)] px-3 text-sm font-medium text-[#2A0000]"
                aria-hidden
              >
                +91
              </span>
              <input
                value={decisionPhone}
                onChange={(e) => setDecisionPhone(sanitizeTenDigitPhoneInput(e.target.value))}
                className="w-full bg-transparent px-3 py-2 text-sm text-[#2A0000] placeholder:text-[rgb(58_0_0/0.4)] focus:outline-none"
                placeholder="10-digit number"
                disabled={busy}
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={10}
                aria-label="Mobile number"
                required
                aria-required="true"
              />
            </div>
          </label>
          {mode === "reject" ? (
            <div className="space-y-2">
              <label
                htmlFor="booking-reject-reason"
                className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]/75"
              >
                Reason for rejection <span className="text-[#8B1A1A]">*</span>
              </label>
              <Textarea
                id="booking-reject-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Share why you cannot accept this request…"
                rows={4}
                maxLength={500}
                disabled={busy}
                required
                aria-required="true"
                className="resize-none border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.7)] text-[#2A0000] placeholder:text-[rgb(58_0_0/0.4)]"
              />
              <p className="text-xs text-[#4A0000]/55">{rejectionReason.trim().length}/500</p>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
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
            className={
              mode === "reject"
                ? "luxury-btn-sm luxury-btn-panel-outline w-full border-destructive/40 text-destructive sm:w-auto"
                : "luxury-btn-sm luxury-btn-primary w-full sm:w-auto"
            }
            disabled={busy || !canSubmit}
            onClick={() => void handleConfirm()}
          >
            {busy
              ? mode === "reject"
                ? "Rejecting…"
                : "Accepting…"
              : mode === "reject"
                ? "Confirm rejection"
                : "Confirm accept"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
