import type { SupabaseClient } from "@supabase/supabase-js";
import { decodeJwt } from "@/lib/jwt";

export async function signInWithJwtToken(supabase: SupabaseClient, rawToken: string) {
  const accessToken = rawToken.trim();
  if (!accessToken) {
    throw new Error("Paste a JWT access token.");
  }

  if (!decodeJwt(accessToken)) {
    throw new Error("Invalid JWT format. Expected header.payload.signature.");
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error(
      error?.message ??
        "This JWT is not valid for Royal Passage. Use a Supabase access token from host/admin sign-in.",
    );
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: accessToken,
  });

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  return data.user;
}
