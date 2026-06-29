import { ConnectError, createClient, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { RoyalPassageService } from "@/gen/royalpassage/v1/service_pb";
import { isApiConfigured, readApiBaseUrl, toErrorMessage } from "@/lib/api/client";

function authInterceptor(accessToken: string): Interceptor {
  return (next) => async (req) => {
    const token = accessToken.trim();
    if (token) {
      req.header.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
    }
    return next(req);
  };
}

export function createRoyalPassageClient(accessToken?: string) {
  const baseUrl = readApiBaseUrl();
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const transport = createConnectTransport({
    baseUrl,
    interceptors: accessToken ? [authInterceptor(accessToken)] : [],
  });

  return createClient(RoyalPassageService, transport);
}

export async function rpcCall<T>(fn: () => Promise<T>, fallback = "Request failed."): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      const base = readApiBaseUrl() || "the API";
      throw new Error(
        `Cannot reach the API at ${base}. On Vercel set VITE_API_BASE_URL=https://the-royal-passage.onrender.com. On Render set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then redeploy.`,
      );
    }
    if (err instanceof ConnectError) {
      throw new Error(err.rawMessage || err.message || fallback);
    }
    throw new Error(toErrorMessage(err, fallback));
  }
}

export { isApiConfigured, readApiBaseUrl };
