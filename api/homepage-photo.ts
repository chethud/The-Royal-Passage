import {
  applyHomepagePhotoCore,
  commitHomepagePhotoWithUpload,
} from "../src/lib/homepage-photo.server.js";
import { getSupabaseConfigError } from "../src/lib/env.server.js";

type VercelRequest = {
  method?: string;
  body?: unknown;
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

    let result;
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

    res.setHeader("Content-Type", "application/json");
    return res.status(200).end(JSON.stringify(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save homepage photo.";
    res.setHeader("Content-Type", "application/json");
    return res.status(500).end(JSON.stringify({ error: message }));
  }
}
