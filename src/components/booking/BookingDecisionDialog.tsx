import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

  const handleConfirm = async () => {
    const name = decisionName.trim();
    const phone = decisionPhone.trim();
    const reason = rejectionReason.trim();
    if (name.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (phone.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (mode === "reject" && reason.length < 3) {
      setError("Please enter a rejection reason (at least 3 characters).");
      return;
    }
    setError(null);
    try {
      await onConfirm({
        decisionName: name,
        decisionPhone: phone,
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
      <DialogContent className="max-w-md border-[rgb(74_0_0/0.2)] bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label text-xs">Your name</span>
            <input
              value={decisionName}
              onChange={(e) => setDecisionName(e.target.value)}
              className={inputClass}
              placeholder="Full name"
              disabled={busy}
              autoComplete="name"
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label text-xs">Your phone</span>
            <input
              value={decisionPhone}
              onChange={(e) => setDecisionPhone(e.target.value)}
              className={inputClass}
              placeholder="+91 …"
              disabled={busy}
              autoComplete="tel"
            />
          </label>
          {mode === "reject" ? (
            <div className="space-y-2">
              <label htmlFor="booking-reject-reason" className="eyebrow luxury-panel-label text-xs">
                Reason for rejection
              </label>
              <Textarea
                id="booking-reject-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Share why you cannot accept this request…"
                rows={4}
                maxLength={500}
                disabled={busy}
                className="resize-none border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.7)]"
              />
              <p className="text-xs text-muted-foreground">{rejectionReason.trim().length}/500</p>
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
            disabled={busy}
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
