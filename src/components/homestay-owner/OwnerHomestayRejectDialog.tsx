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
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { formatDateLong } from "@/lib/date-format";

type OwnerHomestayRejectDialogProps = {
  booking: HomestayBookingSummary | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function OwnerHomestayRejectDialog({
  booking,
  busy,
  onClose,
  onConfirm,
}: OwnerHomestayRejectDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setReason("");
    setError(null);
  }, [booking]);

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError("Please enter a reason (at least 3 characters).");
      return;
    }
    setError(null);
    try {
      await onConfirm(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reject this stay request.");
    }
  };

  return (
    <Dialog
      open={Boolean(booking)}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="max-w-md border-[rgb(74_0_0/0.2)] bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Reject stay request</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {booking ? (
              <>
                Decline {booking.guestName ?? "the guest"}&apos;s request for{" "}
                <span className="font-medium text-foreground">{booking.homestayTitle}</span> (
                {formatDateLong(booking.checkIn)} → {formatDateLong(booking.checkOut)}). The guest
                will see your reason.
              </>
            ) : (
              "Share why you cannot accept this stay."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="homestay-reject-reason" className="eyebrow luxury-panel-label text-xs">
            Reason for rejection
          </label>
          <Textarea
            id="homestay-reject-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Dates are no longer available, property under maintenance…"
            rows={4}
            maxLength={500}
            disabled={busy}
            className="resize-none border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.7)]"
          />
          <p className="text-xs text-muted-foreground">{reason.trim().length}/500</p>
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
            className="luxury-btn-sm luxury-btn-panel-outline w-full border-destructive/40 text-destructive sm:w-auto"
            disabled={busy}
            onClick={() => void handleConfirm()}
          >
            {busy ? "Rejecting…" : "Confirm rejection"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
