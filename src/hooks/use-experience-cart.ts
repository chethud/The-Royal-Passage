import { useCallback, useEffect, useState } from "react";
import {
  addCartItem,
  cartItemCount,
  isExperienceInCart,
  isHomestayInCart,
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

  const remove = useCallback((id: string) => {
    setItems(removeCartItem(id));
    setCount(cartItemCount());
  }, []);

  const has = useCallback((id: string) => isInCart(id), [items]);
  const hasExperience = useCallback((experienceId: string) => isExperienceInCart(experienceId), [items]);
  const hasHomestay = useCallback((homestayId: string) => isHomestayInCart(homestayId), [items]);

  return { items, count, add, remove, has, hasExperience, hasHomestay, sync };
}
