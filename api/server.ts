// Vercel serverless function that fronts the TanStack Start SSR bundle.
// `vercel.json` rewrites every non-static path here, while preserving req.url.

type FetchHandler = {
  fetch: (request: Request) => Promise<Response> | Response;
};

type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { encrypted?: boolean };
  body?: unknown;
  [Symbol.asyncIterator]?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string | string[]) => void;
  end: (body?: Buffer) => void;
};

let serverPromise: Promise<FetchHandler> | undefined;

function loadServer() {
  if (!serverPromise) {
    serverPromise = (async () => {
      // @ts-expect-error - emitted by `vite build` at deploy time; no shipped types.
      const mod = await import("../dist/server/server.js");
      return mod.default as FetchHandler;
    })();
  }
  return serverPromise;
}

function getRequestOrigin(req: VercelRequest) {
  const proto =
    typeof req.headers["x-forwarded-proto"] === "string"
      ? req.headers["x-forwarded-proto"]
      : req.socket?.encrypted
        ? "https"
        : "http";
  const host =
    typeof req.headers["x-forwarded-host"] === "string"
      ? req.headers["x-forwarded-host"]
      : typeof req.headers.host === "string"
        ? req.headers.host
        : "localhost";

  return `${proto}://${host}`;
}

function toFetchHeaders(req: VercelRequest) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    }
  }

  return headers;
}

function isBodyStream(value: unknown): value is ReadableStream<Uint8Array> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ReadableStream<Uint8Array>).getReader === "function"
  );
}

function toFetchBody(req: VercelRequest, method: string): BodyInit | undefined {
  if (method === "GET" || method === "HEAD") return undefined;

  const raw = req.body;
  if (raw == null) {
    if (typeof req[Symbol.asyncIterator] === "function") {
      return req as unknown as BodyInit;
    }
    return undefined;
  }

  if (typeof raw === "string") return raw;
  if (Buffer.isBuffer(raw)) return raw;
  if (raw instanceof Uint8Array) return raw;
  if (raw instanceof ArrayBuffer) return raw;
  if (typeof FormData !== "undefined" && raw instanceof FormData) return raw;
  if (typeof Blob !== "undefined" && raw instanceof Blob) return raw;
  if (isBodyStream(raw)) return raw;
  if (typeof raw === "object") return JSON.stringify(raw);

  return String(raw);
}

function toFetchRequest(req: VercelRequest) {
  const method = req.method ?? "GET";
  const bodyless = method === "GET" || method === "HEAD";
  const body = bodyless ? undefined : toFetchBody(req, method);
  const needsDuplex = !bodyless && isBodyStream(body);

  return new Request(new URL(req.url ?? "/", getRequestOrigin(req)), {
    method,
    headers: toFetchHeaders(req),
    body,
    ...(needsDuplex ? { duplex: "half" as const } : {}),
  });
}

async function sendFetchResponse(response: Response, res: VercelResponse) {
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = Buffer.from(await response.arrayBuffer());
  res.status(response.status).end(body);
}

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  const server = await loadServer();
  const response = await server.fetch(toFetchRequest(req));
  await sendFetchResponse(response, res);
}
