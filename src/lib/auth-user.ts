import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isApiConfigured } from "@/lib/api/client";
import { fetchGuestProfile } from "@/lib/api/guest";
import { ensureGuestProfile, fetchUserProfile, type UserProfile } from "@/lib/profiles";
import { isUserRole, type UserRole } from "@/lib/roles";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const USER_CACHE_KEY = "rp_auth_user_v1";

type CachedUser = {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
};

function readCachedUser(): CachedUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedUser;
  } catch {
    return null;
  }
}

function writeCachedUser(user: User | null, role?: UserRole | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(USER_CACHE_KEY);
    return;
  }
  const meta = user.user_metadata ?? {};
  const payload: CachedUser = {
    id: user.id,
    email: user.email,
    fullName: (meta.full_name as string | undefined) ?? (meta.name as string | undefined),
    phone: (meta.phone as string | undefined) ?? user.phone ?? undefined,
    role: role ?? undefined,
  };
  window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
}

function userDisplayName(user: User | null, profile: UserProfile | null, cachedUser: CachedUser | null): string | null {
  if (profile?.fullName?.trim()) return profile.fullName.trim();
  if (user) {
    const meta = user.user_metadata ?? {};
    const fullName = (meta.full_name as string | undefined) ?? (meta.name as string | undefined);
    if (fullName?.trim()) return fullName.trim();
    if (user.email) return user.email.split("@")[0];
  }
  if (cachedUser?.fullName?.trim()) return cachedUser.fullName.trim();
  if (cachedUser?.email) return cachedUser.email.split("@")[0];
  return null;
}

function mapApiGuestProfile(apiProfile: Awaited<ReturnType<typeof fetchGuestProfile>>): UserProfile {
  return {
    id: apiProfile.id,
    fullName: apiProfile.fullName,
    phone: apiProfile.phone,
    role: isUserRole(apiProfile.role) ? apiProfile.role : "guest",
    hostId: null,
  };
}

async function loadProfileForUser(user: User, accessToken?: string | null): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowser();
  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name as string | undefined) ?? (meta.name as string | undefined);
  const phone = (meta.phone as string | undefined) ?? user.phone ?? undefined;

  let profile =
    (await fetchUserProfile(supabase, user.id)) ??
    (await ensureGuestProfile(supabase, user.id, { fullName, phone }));

  if (!profile && accessToken && isApiConfigured()) {
    try {
      const apiProfile = await fetchGuestProfile(accessToken);
      profile = mapApiGuestProfile(apiProfile);
    } catch {
      // API profile sync is best-effort; local profile may still work.
    }
  }

  return profile;
}

export function useAuthUser() {
  const configured = isSupabaseBrowserConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(configured);
  const [cachedUser, setCachedUser] = useState<CachedUser | null>(() => readCachedUser());

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const supabase = getSupabaseBrowser();
    let mounted = true;

    const syncUser = async (nextUser: User | null, sessionToken?: string | null) => {
      if (!mounted) return;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setAccessToken(null);
        writeCachedUser(null);
        setCachedUser(readCachedUser());
        setLoading(false);
        return;
      }

      const token = sessionToken ?? null;
      setAccessToken(token);
      setLoading(false);

      const resolvedToken =
        token ?? (await supabase.auth.getSession()).data.session?.access_token ?? null;
      if (!mounted) return;
      if (resolvedToken !== token) {
        setAccessToken(resolvedToken);
      }

      const nextProfile = await loadProfileForUser(nextUser, resolvedToken);
      if (!mounted) return;
      setProfile(nextProfile);
      writeCachedUser(nextUser, nextProfile?.role);
      setCachedUser(readCachedUser());
    };

    void supabase.auth.getSession().then(({ data }) => {
      void syncUser(data.session?.user ?? null, data.session?.access_token ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null, session?.access_token ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const displayName = useMemo(
    () => userDisplayName(user, profile, cachedUser),
    [cachedUser, profile, user],
  );

  const role = profile?.role ?? (user ? cachedUser?.role : null) ?? null;

  return { user, profile, role, loading, configured, displayName, accessToken };
}
