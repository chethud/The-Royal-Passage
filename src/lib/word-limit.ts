export const HOMESTAY_DESCRIPTION_MAX_WORDS = 70;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function truncateToWordLimit(text: string, maxWords: number): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) return trimmed;
  return words.slice(0, maxWords).join(" ");
}

/** Prevent typing past a word cap while keeping trailing space while composing. */
export function limitWordsOnInput(value: string, maxWords: number): string {
  const leadingSpace = value.match(/^\s+/)?.[0] ?? "";
  const core = value.trim();
  if (!core) return value;
  const words = core.split(/\s+/);
  if (words.length <= maxWords) return value;
  return leadingSpace + words.slice(0, maxWords).join(" ");
}
