import { Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { deleteWishlistItem, listWishlist, saveWishlistItem } from "@/lib/wishlist-fns";

type WishlistButtonProps = {
  experienceId: string;
  className?: string;
};

export function WishlistButton({ experienceId, className = "" }: WishlistButtonProps) {
  const { user, role } = useAuthUser();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadSavedState = useCallback(async () => {
    if (!user || role !== "guest") {
      setInitialized(true);
      return;
    }

    try {
      const { data } = await getSupabaseBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const items = await listWishlist({ data: { accessToken: token } });
      setSaved(items.some((item) => item.experienceId === experienceId));
    } catch {
      // Ignore — wishlist is optional UI enhancement
    } finally {
      setInitialized(true);
    }
  }, [experienceId, role, user]);

  useEffect(() => {
    void loadSavedState();
  }, [loadSavedState]);

  if (!user || role !== "guest" || !initialized) {
    return null;
  }

  const toggle = async () => {
    setLoading(true);
    try {
      const { data } = await getSupabaseBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      if (saved) {
        await deleteWishlistItem({ data: { accessToken: token, experienceId } });
        setSaved(false);
      } else {
        await saveWishlistItem({ data: { accessToken: token, experienceId } });
        setSaved(true);
      }
    } catch {
      // Keep UI stable on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void toggle()}
      className={`rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/80 p-2.5 text-foreground backdrop-blur-sm transition-colors hover:border-ember/50 disabled:opacity-50 ${className}`}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-ember text-ember" : ""}`} />
    </button>
  );
}
