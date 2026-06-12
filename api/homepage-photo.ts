import {
  applyHomepagePhotoCore,
  commitHomepagePhotoWithUpload,
  commitHomepagePhotoWithUploadBytes,
} from "../src/lib/homepage-photo.server.js";
import { getSupabaseConfigError } from "../src/lib/env.server.js";

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
  section?: "showcase" | "journal";
  itemIndex?: number;
  publicUrl?: string;
  fileName?: string;
  mimeType?: string;
  base64?: string;
};

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

function parseItemIndex(raw: string | undefined): number | null {
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 0 || value > 2) return null;
  return value;
}

function parseSection(raw: string | undefined): "showcase" | "journal" | null {
  if (raw === "showcase" || raw === "journal") return raw;
  return null;
}

function decodeFileName(raw: string | undefined): string {
  if (!raw) return "photo.jpg";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end(JSON.stringify({ error: "Method not allowed." }));
  }

  try {
    const configError = getSupabaseConfigError();
    if (configError) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).end(JSON.stringify({ error: configError }));
    }

    let result;

    if (isBinaryPhotoRequest(req) && !isJsonRequest(req)) {
      const accessToken = headerValue(req, "x-access-token")?.trim();
      const section = parseSection(headerValue(req, "x-section"));
      const itemIndex = parseItemIndex(headerValue(req, "x-item-index"));
      const fileName = decodeFileName(headerValue(req, "x-file-name"));
      const mimeType = headerValue(req, "content-type")?.split(";")[0]?.trim() || "application/octet-stream";
      const bytes = await readRawBody(req);

      if (!accessToken || !section || itemIndex == null) {
        return res.status(400).end(JSON.stringify({ error: "Missing required upload headers." }));
      }

      if (bytes.byteLength === 0) {
        return res.status(400).end(JSON.stringify({ error: "Photo file is empty." }));
      }

      result = await commitHomepagePhotoWithUploadBytes({
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
        return res.status(400).end(JSON.stringify({ error: "Missing required fields." }));
      }

      if (section !== "showcase" && section !== "journal") {
        return res.status(400).end(JSON.stringify({ error: "Invalid section." }));
      }

      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex > 2) {
        return res.status(400).end(JSON.stringify({ error: "Invalid item index." }));
      }

      if (payload.base64?.trim()) {
        if (!payload.fileName?.trim() || !payload.mimeType?.trim()) {
          return res.status(400).end(JSON.stringify({ error: "Missing file metadata." }));
        }

        result = await commitHomepagePhotoWithUpload({
          accessToken,
          section,
          itemIndex,
          fileName: payload.fileName.trim(),
          mimeType: payload.mimeType.trim(),
          base64: payload.base64.trim(),
        });
      } else if (payload.publicUrl?.trim()) {
        result = await applyHomepagePhotoCore({
          accessToken,
          section,
          itemIndex,
          publicUrl: payload.publicUrl.trim(),
        });
      } else {
        return res.status(400).end(JSON.stringify({ error: "Provide a photo file or publicUrl." }));
      }
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).end(JSON.stringify(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save homepage photo.";
    res.setHeader("Content-Type", "application/json");
    return res.status(500).end(JSON.stringify({ error: message }));
  }
}
