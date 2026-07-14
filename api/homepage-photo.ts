type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type HomepagePhotoRequest = {
  accessToken?: string;
  section?: "showcase" | "journal" | "hero" | "homestayHero";
  itemIndex?: number;
  publicUrl?: string;
  fileName?: string;
  mimeType?: string;
  base64?: string;
};

type HomepagePhotoApi = {
  getSupabaseConfigError: () => string | null;
  commitHomepagePhotoWithUploadBytes: (input: {
    accessToken: string;
    section: "showcase" | "journal" | "hero" | "homestayHero";
    itemIndex: number;
    fileName: string;
    mimeType: string;
    bytes: Uint8Array;
  }) => Promise<{ publicUrl: string; version: number }>;
  commitHomepagePhotoWithUpload: (input: {
    accessToken: string;
    section: "showcase" | "journal" | "hero" | "homestayHero";
    itemIndex: number;
    fileName: string;
    mimeType: string;
    base64: string;
  }) => Promise<{ publicUrl: string; version: number }>;
  applyHomepagePhotoCore: (input: {
    accessToken: string;
    section: "showcase" | "journal" | "hero" | "homestayHero";
    itemIndex: number;
    publicUrl: string;
  }) => Promise<{ publicUrl: string; version: number }>;
};

let apiPromise: Promise<HomepagePhotoApi> | undefined;

function loadHomepagePhotoApi() {
  if (!apiPromise) {
    apiPromise = import("../dist/server/homepage-photo-api.js") as Promise<HomepagePhotoApi>;
  }
  return apiPromise;
}

function headerValue(req: VercelRequest, name: string): string | undefined {
  const raw = req.headers?.[name.toLowerCase()] ?? req.headers?.[name];
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}

function readRequestBody(req: VercelRequest): HomepagePhotoRequest {
  const body = req.body;
  if (!body) return {};
  if (typeof body === "string") {
    return JSON.parse(body) as HomepagePhotoRequest;
  }
  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString("utf8")) as HomepagePhotoRequest;
  }
  if (typeof body === "object") {
    return body as HomepagePhotoRequest;
  }
  return {};
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const body = req.body;
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  if (typeof body === "string") return Buffer.from(body, "binary");

  if (typeof req[Symbol.asyncIterator] === "function") {
    const chunks: Buffer[] = [];
    for await (const chunk of req as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  return Buffer.alloc(0);
}

function parseSection(
  raw: string | undefined,
): "showcase" | "journal" | "hero" | "homestayHero" | null {
  if (raw === "showcase" || raw === "journal" || raw === "hero" || raw === "homestayHero") {
    return raw;
  }
  return null;
}

function parseItemIndex(
  raw: string | undefined,
  section: "showcase" | "journal" | "hero" | "homestayHero",
): number | null {
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  const max = section === "hero" ? 11 : section === "homestayHero" ? 4 : 2;
  if (!Number.isInteger(value) || value < 0 || value > max) return null;
  return value;
}

function decodeFileName(raw: string | undefined): string {
  if (!raw) return "photo.jpg";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function readAccessToken(req: VercelRequest): string | undefined {
  const authorization = headerValue(req, "authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  return headerValue(req, "x-access-token")?.trim();
}

function isJsonRequest(req: VercelRequest): boolean {
  const contentType = headerValue(req, "content-type") ?? "";
  return contentType.includes("application/json");
}

function isBinaryPhotoRequest(req: VercelRequest): boolean {
  const contentType = headerValue(req, "content-type") ?? "";
  return (
    contentType.startsWith("image/") ||
    contentType.includes("application/octet-stream") ||
    Boolean(headerValue(req, "x-file-name"))
  );
}

function jsonError(res: VercelResponse, status: number, message: string) {
  res.setHeader("Content-Type", "application/json");
  return res.status(status).end(JSON.stringify({ error: message }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonError(res, 405, "Method not allowed.");
  }

  try {
    const api = await loadHomepagePhotoApi();
    const configError = api.getSupabaseConfigError();
    if (configError) {
      return jsonError(res, 500, configError);
    }

    let result;

    if (isBinaryPhotoRequest(req) && !isJsonRequest(req)) {
      const accessToken = readAccessToken(req);
      const section = parseSection(headerValue(req, "x-section"));
      const itemIndex = section != null ? parseItemIndex(headerValue(req, "x-item-index"), section) : null;
      const fileName = decodeFileName(headerValue(req, "x-file-name"));
      const mimeType =
        headerValue(req, "content-type")?.split(";")[0]?.trim() || "application/octet-stream";
      const bytes = await readRawBody(req);

      if (!accessToken || !section || itemIndex == null) {
        return jsonError(res, 400, "Missing required upload headers.");
      }

      if (bytes.byteLength === 0) {
        return jsonError(res, 400, "Photo file is empty.");
      }

      result = await api.commitHomepagePhotoWithUploadBytes({
        accessToken,
        section,
        itemIndex,
        fileName,
        mimeType,
        bytes,
      });
    } else {
      const payload = readRequestBody(req);
      const accessToken = payload.accessToken?.trim();
      const section = payload.section;
      const itemIndex = payload.itemIndex;

      if (!accessToken || !section || itemIndex == null) {
        return jsonError(res, 400, "Missing required fields.");
      }

      if (
        section !== "showcase" &&
        section !== "journal" &&
        section !== "hero" &&
        section !== "homestayHero"
      ) {
        return jsonError(res, 400, "Invalid section.");
      }

      const maxIndex = section === "hero" ? 11 : section === "homestayHero" ? 4 : 2;
      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex > maxIndex) {
        return jsonError(res, 400, "Invalid item index.");
      }

      if (payload.base64?.trim()) {
        if (!payload.fileName?.trim() || !payload.mimeType?.trim()) {
          return jsonError(res, 400, "Missing file metadata.");
        }

        result = await api.commitHomepagePhotoWithUpload({
          accessToken,
          section,
          itemIndex,
          fileName: payload.fileName.trim(),
          mimeType: payload.mimeType.trim(),
          base64: payload.base64.trim(),
        });
      } else if (payload.publicUrl?.trim()) {
        result = await api.applyHomepagePhotoCore({
          accessToken,
          section,
          itemIndex,
          publicUrl: payload.publicUrl.trim(),
        });
      } else {
        return jsonError(res, 400, "Provide a photo file or publicUrl.");
      }
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).end(JSON.stringify(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save homepage photo.";
    return jsonError(res, 500, message);
  }
}
