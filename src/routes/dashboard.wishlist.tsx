import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { WishlistExperienceGrid } from "@/components/wishlist/WishlistExperienceGrid";
import { deleteWishlistItem, listWishlist, type WishlistItem } from "@/lib/wishlist-fns";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/wishlist")({
  head: () => ({
    meta: [{ title: "Wishlist — The Royal Passage" }],
  }),
  component: GuestWishlistPage,
});

function GuestWishlistPage() {
  const { accessToken, ready, loading } = useGuestAccess();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const rows = await listWishlist({ data: { accessToken } });
      setItems(rows);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load wishlist.");
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadWishlist();
  }, [loadWishlist, ready]);

  const handleRemove = async (experienceId: string) => {
    if (!accessToken) return;
    setRemovingId(experienceId);
    setPageError(null);
    try {
      await deleteWishlistItem({ data: { accessToken, experienceId } });
      setItems((rows) => rows.filter((row) => row.experienceId !== experienceId));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="Wishlist"
      subtitle="Experiences you have saved for later."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading wishlist…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : items.length === 0 ? (
        <GuestEmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Your wishlist is empty"
          description="Tap the heart on any experience to save it here."
        />
      ) : (
        <WishlistExperienceGrid
          items={items}
          removingId={removingId}
          onRemove={(id) => void handleRemove(id)}
        />
      )}
    </GuestDashboardShell>
  );
}
