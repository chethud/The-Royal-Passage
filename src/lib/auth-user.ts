import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const USER_CACHE_KEY = "rp_auth_user_v1";

type CachedUser = {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
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

function writeCachedUser(user: User | null) {
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
  };
  window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
}

function userDisplayName(user: User | null, cachedUser: CachedUser | null): string | null {
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

export function useAuthUser() {
  const configured = isSupabaseBrowserConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [cachedUser, setCachedUser] = useState<CachedUser | null>(() => readCachedUser());

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const supabase = getSupabaseBrowser();
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      writeCachedUser(nextUser);
      setCachedUser(readCachedUser());
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      writeCachedUser(nextUser);
      setCachedUser(readCachedUser());
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const displayName = useMemo(() => userDisplayName(user, cachedUser), [cachedUser, user]);

  return { user, loading, configured, displayName };
}
