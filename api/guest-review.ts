type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type GuestReviewRequest = {
  bookingId?: string;
  rating?: number;
  comment?: string;
};

type GuestReviewApi = {
  createGuestReviewForApi: (
    accessToken: string,
    payload: { bookingId: string; rating: number; comment?: string },
  ) => Promise<unknown>;
};

let apiPromise: Promise<GuestReviewApi> | undefined;

function loadGuestReviewApi() {
  if (!apiPromise) {
    apiPromise = import("../dist/server/guest-review-api.js") as Promise<GuestReviewApi>;
  }
  return apiPromise;
}

function headerValue(req: VercelRequest, name: string): string | undefined {
  const raw = req.headers?.[name.toLowerCase()] ?? req.headers?.[name];
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}

function readBearerToken(req: VercelRequest): string {
  const auth = headerValue(req, "authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();
}

function readRequestBody(req: VercelRequest): GuestReviewRequest {
  const body = req.body;
  if (!body) return {};
  if (typeof body === "string") {
    return JSON.parse(body) as GuestReviewRequest;
  }
  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString("utf8")) as GuestReviewRequest;
  }
  if (typeof body === "object") {
    return body as GuestReviewRequest;
  }
  return {};
}

function json(res: VercelResponse, status: number, payload: Record<string, unknown>) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  const accessToken = readBearerToken(req);
  if (!accessToken) {
    json(res, 401, { error: "Please sign in again." });
    return;
  }

  const body = readRequestBody(req);
  const bookingId = body.bookingId?.trim();
  const rating = body.rating;
  const comment = body.comment?.trim() || undefined;

  if (!bookingId) {
    json(res, 400, { error: "Booking id is required." });
    return;
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    json(res, 400, { error: "Rating must be between 1 and 5." });
    return;
  }

  try {
    const api = await loadGuestReviewApi();
    await api.createGuestReviewForApi(accessToken, { bookingId, rating, comment });
    json(res, 200, { ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit review.";
    json(res, 400, { error: message });
  }
}
