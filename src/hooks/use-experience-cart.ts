import { useCallback, useEffect, useState } from "react";
import {
  addCartItem,
  cartItemCount,
  isInCart,
  listCartItems,
  removeCartItem,
  subscribeCart,
  type CartItem,
} from "@/lib/cart-storage";

export function useExperienceCart() {
  const [items, setItems] = useState<CartItem[]>(() => listCartItems());
  const [count, setCount] = useState(() => cartItemCount());

  const sync = useCallback(() => {
    setItems(listCartItems());
    setCount(cartItemCount());
  }, []);

  useEffect(() => {
    sync();
    return subscribeCart(sync);
  }, [sync]);

  const add = useCallback((item: CartItem) => {
    setItems(addCartItem(item));
    setCount(cartItemCount());
  }, []);

  const remove = useCallback((experienceId: string) => {
    setItems(removeCartItem(experienceId));
    setCount(cartItemCount());
  }, []);

  const has = useCallback((experienceId: string) => isInCart(experienceId), [items]);

  return { items, count, add, remove, has, sync };
}
