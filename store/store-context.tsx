"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  getProductById,
  getCoupon,
  priceOf,
  type Product,
  type Coupon,
} from "@/lib/catalog";
import { deliveryFeeFor } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CartLine = {
  productId: string;
  size?: string;
  color?: string;
  variant?: string;
  unitPriceOverride?: number;
  qty: number;
};

export type ResolvedLine = {
  key: string;
  product: Product;
  size?: string;
  color?: string;
  variant?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    size?: string;
    color?: string;
    variant?: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    area: string;
    city: string;
  };
  paymentMethod: "M-Pesa" | "Cash on Delivery";
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  statusHistory: { status: string; timestamp: string; note?: string }[];
  cancellationReason?: string;
};

const lineKey = (l: CartLine) => `${l.productId}|${l.size ?? ""}|${l.color ?? ""}|${l.variant ?? ""}`;

/* ------------------------------------------------------------------ */
/*  State + reducer                                                    */
/* ------------------------------------------------------------------ */

type State = {
  hydrated: boolean;
  cart: CartLine[];
  wishlist: string[];
  couponCode: string | null;
  orders: Order[];
  productCache: Record<string, Product>;
};

type Action =
  | { type: "HYDRATE"; payload: Partial<State> }
  | { type: "ADD"; line: CartLine; product: Product }
  | { type: "SET_QTY"; key: string; qty: number }
  | { type: "REMOVE"; key: string }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_WISH"; id: string; product?: Product }
  | { type: "SET_COUPON"; code: string | null }
  | { type: "ADD_ORDER"; order: Order };

const initial: State = {
  hydrated: false,
  cart: [],
  wishlist: [],
  couponCode: null,
  orders: [],
  productCache: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };
    case "ADD": {
      const k = lineKey(action.line);
      const existing = state.cart.find((l) => lineKey(l) === k);
      const cart = existing
        ? state.cart.map((l) =>
            lineKey(l) === k ? { ...l, qty: l.qty + action.line.qty } : l
          )
        : [...state.cart, action.line];
      return { ...state, cart, productCache: { ...state.productCache, [action.product.id]: action.product } };
    }
    case "SET_QTY": {
      const cart = state.cart
        .map((l) => (lineKey(l) === action.key ? { ...l, qty: action.qty } : l))
        .filter((l) => l.qty > 0);
      return { ...state, cart };
    }
    case "REMOVE":
      return { ...state, cart: state.cart.filter((l) => lineKey(l) !== action.key) };
    case "CLEAR_CART":
      return { ...state, cart: [], couponCode: null };
    case "TOGGLE_WISH": {
      const wishlist = state.wishlist.includes(action.id)
        ? state.wishlist.filter((w) => w !== action.id)
        : [...state.wishlist, action.id];
      const productCache = action.product
        ? { ...state.productCache, [action.product.id]: action.product }
        : state.productCache;
      return { ...state, wishlist, productCache };
    }
    case "SET_COUPON":
      return { ...state, couponCode: action.code };
    case "ADD_ORDER":
      return { ...state, orders: [action.order, ...state.orders] };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Context value                                                      */
/* ------------------------------------------------------------------ */

type StoreValue = {
  hydrated: boolean;
  // cart
  lines: ResolvedLine[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  addToCart: (
    product: Product,
    opts?: { qty?: number; size?: string; color?: string; variant?: string; variantPrice?: number; silent?: boolean }
  ) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  // coupon
  coupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  // wishlist
  wishlist: Product[];
  wishlistCount: number;
  isWished: (id: string) => boolean;
  toggleWishlist: (product: Product | string) => void;
  // drawers
  cartOpen: boolean;
  wishlistOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setWishlistOpen: (v: boolean) => void;
  // orders (mock)
  orders: Order[];
  createOrder: (o: Omit<Order, "id" | "date" | "status" | "statusHistory">) => Order;
  getOrder: (id: string) => Order | undefined;
  // toast
  toast: string | null;
  notify: (message: string) => void;
};

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [toast, setToast] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // hydrate
  useEffect(() => {
    try {
      dispatch({
        type: "HYDRATE",
        payload: {
          cart: JSON.parse(localStorage.getItem("ncs_cart") || "[]"),
          wishlist: JSON.parse(localStorage.getItem("ncs_wishlist") || "[]"),
          couponCode: JSON.parse(localStorage.getItem("ncs_coupon") || "null"),
          orders: JSON.parse(localStorage.getItem("ncs_orders") || "[]"),
          productCache: JSON.parse(localStorage.getItem("ncs_product_cache") || "{}"),
        },
      });
    } catch {
      dispatch({ type: "HYDRATE", payload: {} });
    }
  }, []);

  // persist
  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem("ncs_cart", JSON.stringify(state.cart));
    localStorage.setItem("ncs_wishlist", JSON.stringify(state.wishlist));
    localStorage.setItem("ncs_coupon", JSON.stringify(state.couponCode));
    localStorage.setItem("ncs_orders", JSON.stringify(state.orders));
    localStorage.setItem("ncs_product_cache", JSON.stringify(state.productCache));
  }, [state]);

  // Resolve a product from the runtime cache first, then the static catalog.
  const resolve = useCallback(
    (id: string): Product | null => state.productCache[id] ?? getProductById(id) ?? null,
    [state.productCache]
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as unknown as { t?: number }).t);
    (flash as unknown as { t?: number }).t = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const addToCart: StoreValue["addToCart"] = useCallback(
    (product, opts) => {
      dispatch({
        type: "ADD",
        line: { productId: product.id, size: opts?.size, color: opts?.color, variant: opts?.variant, unitPriceOverride: opts?.variantPrice, qty: opts?.qty ?? 1 },
        product,
      });
      if (!opts?.silent) {
        flash(`${product.name} added to cart`);
        setCartOpen(true);
      }
    },
    [flash]
  );

  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "SET_QTY", key, qty }), []);
  const removeLine = useCallback((key: string) => dispatch({ type: "REMOVE", key }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const toggleWishlist = useCallback(
    (productOrId: Product | string) => {
      const isObj = typeof productOrId !== "string";
      const id = isObj ? productOrId.id : productOrId;
      const had = state.wishlist.includes(id);
      dispatch({ type: "TOGGLE_WISH", id, product: isObj ? productOrId : undefined });
      const name = (isObj ? productOrId.name : resolve(id)?.name) ?? "Item";
      flash(had ? `${name} removed from wishlist` : `${name} saved to wishlist`);
    },
    [flash, state.wishlist, resolve]
  );
  const isWished = useCallback((id: string) => state.wishlist.includes(id), [state.wishlist]);

  // resolved cart
  const lines = useMemo<ResolvedLine[]>(
    () =>
      state.cart
        .map((l) => {
          const product = resolve(l.productId);
          if (!product) return null;
          const unitPrice = l.unitPriceOverride ?? priceOf(product);
          return {
            key: lineKey(l),
            product,
            size: l.size,
            color: l.color,
            variant: l.variant,
            qty: l.qty,
            unitPrice,
            lineTotal: unitPrice * l.qty,
          } as ResolvedLine;
        })
        .filter((x): x is ResolvedLine => x !== null),
    [state.cart, resolve]
  );

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);
  const cartCount = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const coupon = useMemo(() => (state.couponCode ? getCoupon(state.couponCode) ?? null : null), [state.couponCode]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (subtotal < coupon.minOrder) return 0;
    const raw = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
    return Math.min(Math.round(raw), subtotal);
  }, [coupon, subtotal]);

  const deliveryFee = subtotal === 0 ? 0 : deliveryFeeFor(subtotal - discount);
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const applyCoupon = useCallback(
    (code: string) => {
      const c = getCoupon(code);
      if (!c) {
        setCouponError("That code isn't valid.");
        return false;
      }
      dispatch({ type: "SET_COUPON", code: c.code });
      setCouponError(null);
      flash(`Coupon ${c.code} applied`);
      return true;
    },
    [flash]
  );
  const removeCoupon = useCallback(() => {
    dispatch({ type: "SET_COUPON", code: null });
    setCouponError(null);
  }, []);

  const wishlist = useMemo<Product[]>(
    () => state.wishlist.map((id) => resolve(id)).filter((p): p is Product => !!p),
    [state.wishlist, resolve]
  );

  const createOrder: StoreValue["createOrder"] = useCallback((payload) => {
    const now = new Date().toISOString();
    const order: Order = {
      ...payload,
      id: `NCS-${Math.floor(100000 + Math.random() * 900000)}`,
      date: now,
      status: "Pending",
      statusHistory: [{ status: "Pending", timestamp: now, note: "Order placed" }],
    };
    dispatch({ type: "ADD_ORDER", order });
    return order;
  }, []);

  const getOrder = useCallback((id: string) => state.orders.find((o) => o.id === id), [state.orders]);

  const value: StoreValue = {
    hydrated: state.hydrated,
    lines,
    cartCount,
    subtotal,
    deliveryFee,
    discount,
    total,
    addToCart,
    setQty,
    removeLine,
    clearCart,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    wishlist,
    wishlistCount: wishlist.length,
    isWished,
    toggleWishlist,
    cartOpen,
    wishlistOpen,
    setCartOpen,
    setWishlistOpen,
    orders: state.orders,
    createOrder,
    getOrder,
    toast,
    notify: flash,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <Toast message={toast} />
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

function Toast({ message }: { message: string | null }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4 transition-all duration-300 ${
        message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {message && (
        <div className="pointer-events-auto rounded-full bg-foreground px-6 py-3 text-sm text-background shadow-[0_12px_40px_rgba(61,57,41,0.25)]">
          {message}
        </div>
      )}
    </div>
  );
}
