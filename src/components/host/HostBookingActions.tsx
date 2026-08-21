import { Banknote, Check, CheckCircle2, MoreVertical, Pause, Play, X } from "lucide-react";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HostBookingActionsProps = {
  booking: BookingSummary;
  busy: boolean;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  layout?: "inline" | "stack";
  surface?: "light" | "dark";
  compact?: boolean;
  presentation?: "text" | "icons" | "menu";
};

export function HostBookingActions({
  booking,
  busy,
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
  onPause,
  onResume,
  layout = "inline",
  surface = "light",
  compact = false,
  presentation = "text",
}: HostBookingActionsProps) {
  const isLight = surface === "light";
  const wrap = layout === "stack" ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap" : compact ? "flex flex-wrap gap-1" : "flex flex-wrap gap-2";
  const size = compact ? "px-1.5 py-0.5 text-[0.55rem] leading-tight" : "px-2 py-1 text-xs";
  const primaryBtn = isLight
    ? "luxury-btn-sm luxury-btn-primary disabled:opacity-50"
    : `rounded-sm border ${size} disabled:opacity-50 hover:border-ember/50`;
  const outlineBtn = isLight
    ? "luxury-btn-sm luxury-btn-panel-outline disabled:opacity-50"
    : `rounded-sm border ${size} disabled:opacity-50 hover:border-ember/50`;
  const dangerBtn = isLight
    ? "luxury-btn-sm luxury-btn-panel-danger disabled:opacity-50"
    : `rounded-sm border border-destructive/40 ${size} text-destructive disabled:opacity-50`;

  const iconWrap = "flex flex-wrap items-center gap-1";
  const goldIcon = "host-bookings-action";
  const dangerIcon = "host-bookings-action host-bookings-action--danger";

  const items: { label: string; onSelect: () => void; danger?: boolean }[] = [];
  if (booking.bookingStatus === "pending") {
    items.push(
      { label: "Accept", onSelect: () => onConfirm(booking.id) },
      { label: "Reject", onSelect: () => onReject(booking.id), danger: true },
    );
  } else if (booking.bookingStatus === "confirmed" && booking.isPaused) {
    items.push({ label: "Resume", onSelect: () => onResume(booking.id) });
  } else if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") {
    items.push(
      { label: "Pause", onSelect: () => onPause(booking.id) },
      { label: "Mark paid", onSelect: () => onMarkPaid(booking.id) },
    );
  } else if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") {
    items.push(
      { label: "Pause", onSelect: () => onPause(booking.id) },
      { label: "Complete", onSelect: () => onComplete(booking.id) },
    );
  }

  if (presentation === "menu") {
    if (items.length === 0) {
      return <span className="text-xs opacity-40">—</span>;
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="host-bookings-action" title="Actions" disabled={busy}>
            <MoreVertical size={14} strokeWidth={1.75} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="host-bookings-menu min-w-[9.5rem]">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              disabled={busy}
              className={item.danger ? "text-[#7a1c1c] focus:text-[#7a1c1c]" : ""}
              onSelect={item.onSelect}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (presentation === "icons") {
    if (booking.bookingStatus === "pending") {
      return (
        <div className={iconWrap}>
          <button type="button" disabled={busy} className={goldIcon} title="Accept" onClick={() => onConfirm(booking.id)}>
            <Check size={13} strokeWidth={1.75} />
          </button>
          <button type="button" disabled={busy} className={dangerIcon} title="Reject" onClick={() => onReject(booking.id)}>
            <X size={13} strokeWidth={1.75} />
          </button>
        </div>
      );
    }
    if (booking.bookingStatus === "confirmed" && booking.isPaused) {
      return (
        <button type="button" disabled={busy} className={goldIcon} title="Resume" onClick={() => onResume(booking.id)}>
          <Play size={13} strokeWidth={1.75} />
        </button>
      );
    }
    if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") {
      return (
        <div className={iconWrap}>
          <button type="button" disabled={busy} className={goldIcon} title="Pause" onClick={() => onPause(booking.id)}>
            <Pause size={13} strokeWidth={1.75} />
          </button>
          <button type="button" disabled={busy} className={goldIcon} title="Mark paid" onClick={() => onMarkPaid(booking.id)}>
            <Banknote size={13} strokeWidth={1.75} />
          </button>
        </div>
      );
    }
    if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") {
      return (
        <div className={iconWrap}>
          <button type="button" disabled={busy} className={goldIcon} title="Pause" onClick={() => onPause(booking.id)}>
            <Pause size={13} strokeWidth={1.75} />
          </button>
          <button type="button" disabled={busy} className={goldIcon} title="Complete" onClick={() => onComplete(booking.id)}>
            <CheckCircle2 size={13} strokeWidth={1.75} />
          </button>
        </div>
      );
    }
    return <span className="text-xs opacity-40">—</span>;
  }

  if (booking.bookingStatus === "pending") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => onConfirm(booking.id)}>
          Accept
        </button>
        <button type="button" disabled={busy} className={dangerBtn} onClick={() => onReject(booking.id)}>
          Reject
        </button>
      </div>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.isPaused) {
    return (
      <button type="button" disabled={busy} className={primaryBtn} onClick={() => onResume(booking.id)}>
        Resume
      </button>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={outlineBtn} onClick={() => onPause(booking.id)}>
          Pause
        </button>
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => onMarkPaid(booking.id)}>
          Mark paid
        </button>
      </div>
    );
  }

  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") {
    return (
      <div className={wrap}>
        <button type="button" disabled={busy} className={outlineBtn} onClick={() => onPause(booking.id)}>
          Pause
        </button>
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => onComplete(booking.id)}>
          Complete
        </button>
      </div>
    );
  }

  return <span className={`text-xs ${isLight ? "luxury-panel-body" : "text-muted-foreground"}`}>—</span>;
}
