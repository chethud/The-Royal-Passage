import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

export const bookingPanelStackClass = "space-y-4 sm:space-y-8";
export const bookingStepperGroupClass = "space-y-3.5 sm:space-y-5";
export const bookingFieldGridClass = "grid gap-2.5 sm:grid-cols-2 sm:gap-4";

export const bookingPanelFieldClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-2.5 py-2 text-[0.74rem] luxury-panel-body focus:border-[#4A0000]/50 focus:outline-none sm:px-4 sm:py-3 sm:text-sm";

export const bookingPanelTextareaClass = `${bookingPanelFieldClass} resize-none`;

export function bookingOptionCardClass(active: boolean) {
  return `rounded-sm border px-2.5 py-2 text-left text-[0.72rem] transition-colors sm:px-4 sm:py-3 sm:text-sm ${
    active
      ? "border-[#4A0000]/50 bg-[rgb(74_0_0/0.06)] luxury-panel-heading"
      : "border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.45)] luxury-panel-body hover:border-[#4A0000]/35"
  }`;
}

type BookingSurface = "light" | "dark";

function stepperTone(surface: BookingSurface) {
  if (surface === "light") {
    return {
      label: "eyebrow luxury-panel-label",
      hint: "luxury-panel-body mt-0.5 text-[0.66rem] leading-snug sm:mt-1 sm:text-xs sm:leading-relaxed",
      button:
        "inline-flex h-7 w-7 items-center justify-center text-[#4A0000]/80 transition-colors hover:text-[#4A0000] disabled:opacity-35 sm:h-9 sm:w-9",
      value: "w-7 text-center font-display text-xl text-[#4A0000] sm:w-8 sm:text-2xl",
    };
  }

  return {
    label: "eyebrow text-[#D4AF6A]/90",
    hint: "mt-0.5 text-[0.66rem] leading-snug text-muted-foreground sm:mt-1 sm:text-xs",
    button:
      "inline-flex h-7 w-7 items-center justify-center text-[#D4AF6A] transition-colors hover:text-[#F7F1E8] disabled:opacity-35 sm:h-9 sm:w-9",
    value: "w-7 text-center font-display text-xl text-foreground sm:w-8 sm:text-2xl",
  };
}

export function BookingPanelStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${bookingPanelStackClass} ${className}`.trim()}>{children}</div>;
}

export function BookingStepperGroup({ children }: { children: ReactNode }) {
  return <div className={bookingStepperGroupClass}>{children}</div>;
}

export function BookingIntro({
  label,
  children,
  surface = "light",
}: {
  label: string;
  children: ReactNode;
  surface?: BookingSurface;
}) {
  const tone = stepperTone(surface);
  return (
    <div>
      <div className={`${tone.label} mb-1.5 sm:mb-2`}>{label}</div>
      <p
        className={
          surface === "light"
            ? "luxury-panel-body text-[0.68rem] leading-snug sm:text-xs sm:leading-relaxed"
            : "text-[0.68rem] leading-snug text-muted-foreground/90 sm:text-xs sm:leading-relaxed"
        }
      >
        {children}
      </p>
    </div>
  );
}

export function BookingFieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow luxury-panel-label mb-1 block text-[0.55rem] sm:mb-2 sm:text-[0.7rem]">
      {children}
    </span>
  );
}

export function BookingFieldGrid({ children }: { children: ReactNode }) {
  return <div className={bookingFieldGridClass}>{children}</div>;
}

export function BookingStepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  surface = "light",
  disabled = false,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  surface?: BookingSurface;
  disabled?: boolean;
}) {
  const tone = stepperTone(surface);

  return (
    <div className="flex items-center justify-between gap-2.5 sm:gap-6">
      <div className="min-w-0">
        <div className={tone.label}>{label}</div>
        {hint ? <p className={tone.hint}>{hint}</p> : null}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={`${tone.button} disabled:cursor-default`}
        >
          <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
        </button>
        <span className={tone.value}>{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className={`${tone.button} disabled:cursor-default`}
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export function BookingNotesField({
  label = "Notes (optional)",
  value,
  onChange,
  placeholder,
  surface = "light",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  surface?: BookingSurface;
}) {
  if (surface === "light") {
    return (
      <div>
        <div className="eyebrow luxury-panel-label mb-2 sm:mb-3">{label}</div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          placeholder={placeholder}
          className={`${bookingPanelTextareaClass} placeholder:text-[rgb(58_0_0/0.4)]`}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="eyebrow mb-3 text-[#D4AF6A]/90">{label}</h2>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none border-0 border-b border-[#C8A25A]/25 bg-transparent px-0 py-3 text-sm text-foreground placeholder:text-muted-foreground/55 focus:border-[#C8A25A]/55 focus:outline-none focus:ring-0"
      />
    </div>
  );
}

export function BookingTotalSummary({
  label = "Estimated total",
  breakdown,
  total,
  footer,
  surface = "light",
}: {
  label?: string;
  breakdown: ReactNode;
  total: ReactNode;
  footer?: ReactNode;
  surface?: BookingSurface;
}) {
  const labelClass = surface === "light" ? "eyebrow luxury-panel-label" : "eyebrow text-muted-foreground";
  const bodyClass =
    surface === "light"
      ? "luxury-panel-body mt-0.5 text-[0.64rem] leading-snug sm:mt-1 sm:text-xs"
      : "mt-0.5 text-[0.64rem] leading-snug text-muted-foreground sm:mt-1 sm:text-xs";
  const totalClass =
    surface === "light"
      ? "shrink-0 font-display text-[1.7rem] tracking-tight text-[#4A0000] sm:text-2xl md:text-3xl"
      : "shrink-0 font-display text-[1.7rem] tracking-tight text-[#F7F1E8] sm:text-2xl md:text-3xl";

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className={labelClass}>{label}</div>
        <div className={bodyClass}>{breakdown}</div>
        {footer ? <div className={bodyClass}>{footer}</div> : null}
      </div>
      <div className={totalClass}>{total}</div>
    </div>
  );
}

export function BookingPanelFootnote({
  children,
  surface = "light",
}: {
  children: ReactNode;
  surface?: BookingSurface;
}) {
  return (
    <p
      className={`text-center text-[0.58rem] tracking-wide sm:text-[0.65rem] ${
        surface === "light" ? "luxury-panel-body" : "text-muted-foreground/80"
      }`}
    >
      {children}
    </p>
  );
}
