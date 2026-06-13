import { Heart } from "lucide-react";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { isGuestAccount } from "@/lib/roles";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import {
  addWishlistItemBrowser,
  fetchWishlistIdsBrowser,
  removeWishlistItemBrowser,
} from "@/lib/wishlist-browser";

type WishlistButtonProps = {
  experienceId: string;
  className?: string;
};

export function WishlistButton({ experienceId, className = "" }: WishlistButtonProps) {
  const { user, role } = useAuthUser();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const canUseWishlist = Boolean(user) && isGuestAccount(role) && isSupabaseBrowserConfigured();

  const loadSavedState = useCallback(async () => {
    if (!canUseWishlist) {
      setSaved(false);
      setInitialized(true);
      return;
    }

    try {
      const ids = await fetchWishlistIdsBrowser();
      setSaved(ids.includes(experienceId));
    } catch {
      setSaved(false);
    } finally {
      setInitialized(true);
    }
  }, [canUseWishlist, experienceId]);

  useEffect(() => {
    setInitialized(false);
    void loadSavedState();
  }, [loadSavedState]);

  if (!canUseWishlist || !initialized) {
    return null;
  }

  const toggle = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setLoading(true);
    try {
      if (saved) {
        await removeWishlistItemBrowser(experienceId);
        setSaved(false);
      } else {
        await addWishlistItemBrowser(experienceId);
        setSaved(true);
      }
    } catch {
      // Reload saved state if the write failed (e.g. stale session).
      await loadSavedState();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={(event) => void toggle(event)}
      className={`rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/80 p-2.5 text-foreground backdrop-blur-sm transition-colors hover:border-ember/50 disabled:opacity-50 ${saved ? "border-ember/50" : ""} ${className}`}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-ember text-ember" : ""}`} />
    </button>
  );
}
