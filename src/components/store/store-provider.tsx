'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export type CartItem = {
  key: string; productId: string; variantId: string | null; slug: string; name: string;
  variantName: string | null; price: number; image: string | null; quantity: number; maxQty: number;
};
export type WishItem = { productId: string; slug: string; name: string; price: number; image: string | null };

type Store = {
  ready: boolean;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number; // display only; the server recalculates every total
  addToCart: (item: Omit<CartItem, 'key' | 'quantity'>, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  wishlist: WishItem[];
  toggleWish: (item: WishItem) => void;
  isWished: (productId: string) => boolean;
};

const StoreContext = createContext<Store | null>(null);
const CART_KEY = 'vaasora.cart.v1';
const WISH_KEY = 'vaasora.wishlist.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = read<CartItem[]>(CART_KEY, []);
    setCart(Array.isArray(stored) ? stored.filter((i) => i && i.productId && i.quantity > 0) : []);
    const w = read<WishItem[]>(WISH_KEY, []);
    setWishlist(Array.isArray(w) ? w : []);
    setReady(true);
    // Keep tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCart(read(CART_KEY, []));
      if (e.key === WISH_KEY) setWishlist(read(WISH_KEY, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => { if (ready) write(CART_KEY, cart); }, [cart, ready]);
  useEffect(() => { if (ready) write(WISH_KEY, wishlist); }, [wishlist, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const addToCart: Store['addToCart'] = useCallback((item, qty = 1) => {
    const key = `${item.productId}:${item.variantId ?? '-'}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, ...item, quantity: Math.min(i.quantity + qty, item.maxQty) } : i));
      }
      return [...prev, { ...item, key, quantity: Math.min(qty, item.maxQty) }];
    });
    showToast(`“${item.name}” কার্টে যোগ হয়েছে`);
  }, [showToast]);

  const updateQty = useCallback((key: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxQty)) } : i)));
  }, []);
  const removeItem = useCallback((key: string) => setCart((prev) => prev.filter((i) => i.key !== key)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWish = useCallback((item: WishItem) => {
    setWishlist((prev) => prev.some((w) => w.productId === item.productId)
      ? prev.filter((w) => w.productId !== item.productId)
      : [...prev, item]);
  }, []);
  const isWished = useCallback((id: string) => wishlist.some((w) => w.productId === id), [wishlist]);

  const value = useMemo<Store>(() => ({
    ready, cart, wishlist, addToCart, updateQty, removeItem, clearCart, toggleWish, isWished,
    cartCount: cart.reduce((s, i) => s + i.quantity, 0),
    cartSubtotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
  }), [ready, cart, wishlist, addToCart, updateQty, removeItem, clearCart, toggleWish, isWished]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        {toast && (
          <div className="pointer-events-auto flex items-center gap-4 border border-line bg-ink px-5 py-3 text-sm text-ivory shadow-sm animate-[rise_.25s_ease-out]">
            <span>{toast}</span>
            <Link href="/cart" className="whitespace-nowrap text-[#D9C7AE] underline underline-offset-4">কার্ট দেখুন</Link>
          </div>
        )}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
