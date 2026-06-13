import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { CartItemsSection, WishlistCartSection } from "@/components/cart/CartPageSections";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import type { WishlistItem } from "@/lib/api/wishlist";
import { cartItemFromWishlist } from "@/lib/cart-storage";
import { fetchWishlistBrowser, removeWishlistItemBrowser } from "@/lib/wishlist-browser";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/cart")({
  head: () => ({
    meta: [{ title: "Cart — The Royal Passage" }],
  }),
  component: GuestCartPage,
});

function GuestCartPage() {
  const { accessToken, ready, loading } = useGuestAccess();
  const { items: cartItems, remove: removeFromCart, add: addToCart } = useExperienceCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [removingCartId, setRemovingCartId] = useState<string | null>(null);
  const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(null);
  const [addingWishlistId, setAddingWishlistId] = useState<string | null>(null);

  const cartExperienceIds = useMemo(
    () => new Set(cartItems.map((item) => item.experienceId)),
    [cartItems],
  );

  const loadWishlist = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const rows = await fetchWishlistBrowser();
      setWishlistItems(rows);
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

  const handleRemoveCart = (experienceId: string) => {
    setRemovingCartId(experienceId);
    removeFromCart(experienceId);
    setRemovingCartId(null);
  };

  const handleRemoveWishlist = async (experienceId: string) => {
    setRemovingWishlistId(experienceId);
    setPageError(null);
    try {
      await removeWishlistItemBrowser(experienceId);
      setWishlistItems((rows) => rows.filter((row) => row.experienceId !== experienceId));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to remove wishlist item.");
    } finally {
      setRemovingWishlistId(null);
    }
  };

  const handleAddWishlistToCart = (item: WishlistItem) => {
    setAddingWishlistId(item.experienceId);
    addToCart(cartItemFromWishlist(item));
    window.setTimeout(() => setAddingWishlistId(null), 300);
  };

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="Cart"
      subtitle="Review experiences ready to book, then move saved wishlist items into your cart when you are ready."
    >
      {pageError ? (
        <p className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-ember" />
          <h2 className="font-display text-2xl text-foreground">Cart items</h2>
          <span className="text-sm text-muted-foreground">({cartItems.length})</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Experiences you added to cart. Use <strong className="text-foreground">Buy</strong> to continue
          to checkout.
        </p>
        <CartItemsSection
          items={cartItems}
          removingId={removingCartId}
          onRemove={handleRemoveCart}
        />
      </section>

      <section className="mt-14 space-y-4 border-t border-[oklch(0.88_0.08_86_/_0.12)] pt-10">
        <div className="flex items-center gap-2">
          <span className="text-lg text-ember">♥</span>
          <h2 className="font-display text-2xl text-foreground">Wishlist</h2>
          <span className="text-sm text-muted-foreground">
            ({pageLoading ? "…" : wishlistItems.length})
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Saved for later. Use <strong className="text-foreground">Add to cart</strong> when you want to
          book.
        </p>
        {pageLoading ? (
          <p className="text-sm text-muted-foreground">Loading wishlist…</p>
        ) : (
          <WishlistCartSection
            items={wishlistItems}
            cartExperienceIds={cartExperienceIds}
            removingId={removingWishlistId}
            addingId={addingWishlistId}
            onRemove={(id) => void handleRemoveWishlist(id)}
            onAddToCart={handleAddWishlistToCart}
          />
        )}
      </section>
    </GuestDashboardShell>
  );
}
