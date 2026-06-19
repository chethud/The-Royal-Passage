import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { CartItemsSection, WishlistCartSection } from "@/components/cart/CartPageSections";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import type { WishlistItem } from "@/lib/api/wishlist";
import { cartItemFromWishlist } from "@/lib/cart-storage";
import { fetchWishlistBrowser, removeWishlistItemBrowser } from "@/lib/wishlist-browser";
import { useGuestAccess } from "@/lib/use-guest-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/dashboard/cart/")({
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
    return <PageLoadingGate />;
  }

  return (
    <GuestDashboardShell
      title="Cart"
      subtitle="Your selected experiences, ready to reserve."
      showRoleDescription={false}
    >
      {pageError ? <p className="mb-6 text-sm text-destructive">{pageError}</p> : null}

      <LuxuryCheckoutPanel>
        <div className="mb-6 flex items-baseline justify-between gap-4 luxury-panel-divider border-b pb-5">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="luxury-panel-label h-4 w-4" strokeWidth={1.5} />
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Cart items</h2>
          </div>
          <span className="luxury-panel-body text-[0.65rem] uppercase tracking-[0.14em]">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <CartItemsSection
          items={cartItems}
          removingId={removingCartId}
          onRemove={handleRemoveCart}
          surface="light"
        />
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel className="mt-8">
        <div className="mb-6 flex items-baseline justify-between gap-4 luxury-panel-divider border-b pb-5">
          <div className="flex items-center gap-2.5">
            <Heart className="luxury-panel-label h-4 w-4" strokeWidth={1.5} />
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Wishlist</h2>
          </div>
          <span className="luxury-panel-body text-[0.65rem] uppercase tracking-[0.14em]">
            {pageLoading ? "…" : `${wishlistItems.length} saved`}
          </span>
        </div>

        {pageLoading ? (
          <p className="luxury-panel-body py-8 text-sm">Loading wishlist…</p>
        ) : (
          <WishlistCartSection
            items={wishlistItems}
            cartExperienceIds={cartExperienceIds}
            removingId={removingWishlistId}
            addingId={addingWishlistId}
            onRemove={(id) => void handleRemoveWishlist(id)}
            onAddToCart={handleAddWishlistToCart}
            surface="light"
          />
        )}
      </LuxuryCheckoutPanel>
    </GuestDashboardShell>
  );
}
