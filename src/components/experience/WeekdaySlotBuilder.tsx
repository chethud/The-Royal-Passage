import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";
import { BOOKING_WINDOW_DAYS, hostScheduleDefaultEndIso } from "@/lib/booking-window";
import { Time12hField } from "@/components/experience/Time12hField";
import { isoToWeekdayKey } from "@/lib/slot-week-overview";
import {
  buildSchedulePreview,
  DEFAULT_WEEKDAYS,
  expandWeekdaySchedule,
  formatDateReadable,
  WEEKDAY_OPTIONS,
  type SessionBlockInput,
  type WeekdayKey,
} from "@/lib/weekday-slots";

type WeekdaySlotBuilderProps = {
  busy?: boolean;
  focusDateIso?: string | null;
  onAddSlots: (slots: CreateHostSlotPayload[]) => void;
  /** Light ivory panels (create wizard) vs dark glass (slot manager). */
  surface?: "light" | "dark";
};

type SessionRow = SessionBlockInput & { key: string };

const fieldClass =
  "mt-1.5 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.45)] bg-[oklch(0.14_0.05_22_/_0.85)] px-3 py-2.5 text-sm text-ink [color-scheme:dark]";
const numberFieldClass = `${fieldClass} input-no-spin`;

function panelStyles(surface: "light" | "dark") {
  const light = surface === "light";
  return {
    heading: light ? "text-sm font-medium luxury-panel-heading" : "text-sm font-medium text-ink",
    muted: light ? "luxury-panel-body" : "text-muted-foreground",
    mutedXs: light ? "text-xs luxury-panel-body" : "text-xs text-muted-foreground",
    previewBox: light
      ? "rounded-md border border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm"
      : "rounded-md border border-ember/30 bg-ember/8 px-4 py-3 text-sm",
    previewCount: light ? "font-display text-lg text-[#8B6914]" : "font-display text-lg text-ember",
    previewList: light
      ? "mt-3 space-y-1 border-t border-[rgb(74_0_0/0.12)] pt-3 text-xs luxury-panel-body"
      : "mt-3 space-y-1 border-t border-ember/20 pt-3 text-xs text-ink/90",
    previewMore: light ? "text-[rgb(58_0_0/0.5)]" : "text-muted-foreground",
    sessionCard: light
      ? "rounded-md border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.35)] p-4"
      : "rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] bg-background/10 p-4",
    success: light ? "text-sm text-[#2d6a4f]" : "text-sm text-emerald-300/90",
    label: light ? "eyebrow luxury-panel-label" : "eyebrow text-muted-foreground",
  };
}

const WEEKDAY_PRESETS: { label: string; days: WeekdayKey[] }[] = [
  { label: "Mon–Fri", days: ["mon", "tue", "wed", "thu", "fri"] },
  { label: "Weekends", days: ["sat", "sun"] },
  { label: "Every day", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
];

function formatToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function newSessionRow(startTime = "09:00", endTime = "12:00", capacity = 8): SessionRow {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startTime,
    endTime,
    capacity,
  };
}

export function WeekdaySlotBuilder({
  busy = false,
  focusDateIso = null,
  onAddSlots,
  surface = "dark",
}: WeekdaySlotBuilderProps) {
  const ui = panelStyles(surface);
  const today = useMemo(() => formatToday(), []);
  const defaultEnd = useMemo(() => hostScheduleDefaultEndIso(today), [today]);
  const [weekdays, setWeekdays] = useState<WeekdayKey[]>(DEFAULT_WEEKDAYS);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(defaultEnd);
  const [sessions, setSessions] = useState<SessionRow[]>(() => [newSessionRow()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!focusDateIso) return;
    setFromDate(focusDateIso);
    setToDate(focusDateIso);
    setWeekdays([isoToWeekdayKey(focusDateIso)]);
    setSuccess(null);
    setError(null);
  }, [focusDateIso]);

  const sessionInputs = useMemo(
    (): SessionBlockInput[] =>
      sessions.map(({ startTime, endTime, capacity }) => ({ startTime, endTime, capacity })),
    [sessions],
  );

  const preview = useMemo(
    () =>
      buildSchedulePreview({
        weekdays,
        fromDate,
        toDate,
        sessions: sessionInputs,
      }),
    [fromDate, sessionInputs, toDate, weekdays],
  );

  const clearFeedback = () => {
    setSuccess(null);
    setError(null);
  };

  const toggleWeekday = (key: WeekdayKey) => {
    clearFeedback();
    setWeekdays((prev) =>
      prev.includes(key) ? prev.filter((day) => day !== key) : [...prev, key],
    );
  };

  const applyPreset = (days: WeekdayKey[]) => {
    clearFeedback();
    setWeekdays(days);
  };

  const updateSession = (key: string, patch: Partial<SessionBlockInput>) => {
    clearFeedback();
    setSessions((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const addSessionRow = () => {
    clearFeedback();
    const last = sessions[sessions.length - 1];
    setSessions((prev) => [
      ...prev,
      newSessionRow("14:00", "17:00", last?.capacity ?? 8),
    ]);
  };

  const removeSessionRow = (key: string) => {
    clearFeedback();
    setSessions((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.key !== key)));
  };

  const handleGenerate = () => {
    if (!preview.isValid) {
      setError(preview.validationMessage);
      setSuccess(null);
      return;
    }

    const slots = expandWeekdaySchedule({
      weekdays,
      fromDate,
      toDate,
      sessions: sessionInputs,
    });

    setError(null);
    setSuccess(`Added ${slots.length} session${slots.length === 1 ? "" : "s"}.`);
    onAddSlots(slots);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={ui.label}>From date</span>
          <input
            type="date"
            value={fromDate}
            min={today}
            disabled={busy}
            onChange={(e) => {
              clearFeedback();
              const next = e.target.value;
              setFromDate(next);
              if (next > toDate) setToDate(next);
            }}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className={ui.label}>To date</span>
          <input
            type="date"
            value={toDate}
            min={fromDate || today}
            disabled={busy}
            onChange={(e) => {
              clearFeedback();
              setToDate(e.target.value);
            }}
            className={fieldClass}
          />
        </label>
      </div>
      <p className={ui.mutedXs}>
        Schedule any future dates for your sessions. On the public site, guests can book within the
        next {BOOKING_WINDOW_DAYS} days.
      </p>

      <div>
        <p className={ui.heading}>Which weekdays?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={busy}
              onClick={() => applyPreset(preset.days)}
              className="rounded-sm border border-ember/40 px-3 py-1.5 text-xs font-medium text-ember hover:bg-ember/10 disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = weekdays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                disabled={busy}
                onClick={() => toggleWeekday(day.key)}
                className={`min-w-[3.25rem] rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] disabled:opacity-50 ${
                  active
                    ? "border-ember/70 bg-ember/15 text-ember"
                    : surface === "light"
                      ? "border-[rgb(74_0_0/0.2)] luxury-panel-body hover:border-ember/35"
                      : "border-[oklch(0.88_0.08_86_/_0.3)] text-muted-foreground hover:border-ember/35"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={ui.heading}>Session times</p>
          <button
            type="button"
            disabled={busy}
            onClick={addSessionRow}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ember hover:underline disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add another session
          </button>
        </div>
        <p className={`mt-1 ${ui.mutedXs}`}>
          Add multiple times to run more than one session on the same day (e.g. morning and
          afternoon).
        </p>

        <ul className="mt-3 space-y-3">
          {sessions.map((row, index) => (
            <li
              key={row.key}
              className={ui.sessionCard}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${ui.muted}`}>
                  Session {index + 1}
                </span>
                {sessions.length > 1 ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeSessionRow(row.key)}
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-sm">
                  <span className={ui.label}>Starts</span>
                  <div className="mt-1.5">
                    <Time12hField
                      value={row.startTime}
                      disabled={busy}
                      onChange={(next) => updateSession(row.key, { startTime: next })}
                    />
                  </div>
                </label>
                <label className="block text-sm">
                  <span className={ui.label}>Ends</span>
                  <div className="mt-1.5">
                    <Time12hField
                      value={row.endTime}
                      disabled={busy}
                      onChange={(next) => updateSession(row.key, { endTime: next })}
                    />
                  </div>
                </label>
                <label className="block text-sm">
                  <span className={ui.label}>Guests</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={row.capacity}
                    disabled={busy}
                    onChange={(e) =>
                      updateSession(row.key, { capacity: Number(e.target.value) })
                    }
                    className={numberFieldClass}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={ui.previewBox}>
        <span className={ui.muted}>Will create </span>
        <span className={ui.previewCount}>
          {preview.count > 0 ? preview.count : "—"}
        </span>
        <span className={ui.muted}>
          {" "}
          session{preview.count === 1 ? "" : "s"} · {preview.weekdayLabel} · {preview.dateRangeLabel}
        </span>
        {preview.sampleDates.length > 0 ? (
          <ul className={ui.previewList}>
            {preview.sampleDates.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {preview.count > preview.sampleDates.length ? (
              <li className={ui.previewMore}>
                …and {preview.count - preview.sampleDates.length} more
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className={ui.success}>{success}</p> : null}

      <button
        type="button"
        disabled={busy || !preview.isValid || preview.count === 0}
        onClick={handleGenerate}
        className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {preview.count > 0
          ? `Add ${preview.count} session${preview.count === 1 ? "" : "s"}`
          : "Add sessions"}
      </button>
    </div>
  );
}
