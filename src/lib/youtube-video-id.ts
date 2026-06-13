/** Extract a YouTube video ID from a URL or bare ID string. */
export function parseYoutubeVideoId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] ?? trimmed;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return fromQuery;

      const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
      if (embedMatch?.[1]) return embedMatch[1];

      const shortsMatch = url.pathname.match(/\/shorts\/([\w-]{11})/);
      if (shortsMatch?.[1]) return shortsMatch[1];
    }
  } catch {
    // Not a URL — fall through.
  }

  return trimmed;
}

export function normalizeYoutubeVideoInput(input: string): string {
  return parseYoutubeVideoId(input);
}
