function parseIsoDateAsUtc(dateIso: string): Date {
  const [year, month, day] = dateIso.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

export function formatDateShort(dateIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseIsoDateAsUtc(dateIso));
}

export function formatDateLong(dateIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseIsoDateAsUtc(dateIso));
}

export function formatDateWeekdayShort(dateIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseIsoDateAsUtc(dateIso));
}
