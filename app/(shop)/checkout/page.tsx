"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Smartphone, Banknote, Lock, Loader2, Check, MapPin, Plus } from "lucide-react";
import { useStore } from "@/store/store-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { formatKsh, cn } from "@/lib/utils";

type Method = "M-Pesa" | "Cash on Delivery";
type Address = { _id: string; label?: string; fullName: string; phone: string; street: string; area: string; city: string; isDefault?: boolean };
type Phase = "form" | "awaiting" | "failed";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { hydrated, lines, subtotal, deliveryFee, discount, total, coupon, createOrder, clearCart } = useStore();

  const [form, setForm] = useState({ fullName: "", phone: "", street: "", area: "", city: "Nairobi" });
  const [saved, setSaved] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [method, setMethod] = useState<Method>("Cash on Delivery"); // COD is the default
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shops, setShops] = useState<{ slug: string; bagFee: number; discountPct: number }[]>([]);

  useEffect(() => {
    fetch("/api/shops").then((r) => (r.ok ? r.json() : null)).then((d) => { if (Array.isArray(d)) setShops(d); }).catch(() => {});
  }, []);

  // Shop-level charges: per-shop discounts on their items + one bag fee per distinct shop.
  const { shopDiscount, bagFee } = useMemo(() => {
    const map = new Map(shops.map((s) => [s.slug, s]));
    const present = new Set<string>();
    let disc = 0;
    for (const l of lines) {
      const sh = l.product.shop ? map.get(l.product.shop) : undefined;
      if (sh?.discountPct) disc += Math.round(l.unitPrice * (sh.discountPct / 100)) * l.qty;
      if (l.product.shop) present.add(l.product.shop);
    }
    let bag = 0;
    for (const slug of present) bag += map.get(slug)?.bagFee ?? 0;
    return { shopDiscount: disc, bagFee: bag };
  }, [shops, lines]);

  const grandTotal = Math.max(0, total - shopDiscount + bagFee);

  // Load saved addresses for signed-in shoppers.
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const r = await fetch("/api/user/address");
        if (!r.ok) return;
        const list: Address[] = await r.json();
        if (Array.isArray(list) && list.length) {
          setSaved(list);
          const def = list.find((a) => a.isDefault) ?? list[0];
          setSelectedId(def._id);
        }
      } catch { /* ignore */ }
    })();
  }, [status]);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1100px] px-4 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (lines.length === 0 && phase === "form") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-20 text-center md:px-8">
        <h1 className="font-serif text-2xl text-foreground">Nothing to check out</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6"><Link href="/search">Start shopping</Link></Button>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const activeAddress = (() => {
    if (selectedId !== "new") {
      const a = saved.find((x) => x._id === selectedId);
      if (a) return { fullName: a.fullName, phone: a.phone, street: a.street, area: a.area, city: a.city };
    }
    return form;
  })();

  const validate = () => {
    if (selectedId !== "new") return true; // saved addresses are already valid
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!/^(\+?254|0)\d{8,9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid Kenyan phone number";
    if (!form.street.trim()) e.street = "Required";
    if (!form.area.trim()) e.area = "Required";
    if (!form.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finish = (id: string) => { clearCart(); router.push(`/checkout/success?order=${id}`); };

  // Poll until the order is marked paid by the M-Pesa webhook (or time out).
  const pollPayment = async (id: string, tries = 40, intervalMs = 3000): Promise<boolean> => {
    for (let i = 0; i < tries; i++) {
      await sleep(intervalMs);
      try {
        const r = await fetch(`/api/orders/${id}/payment-status`);
        if (r.ok) { const d = await r.json(); if (d.isPaid) return true; }
      } catch { /* keep polling */ }
    }
    return false;
  };

  const switchToCOD = async () => {
    if (!orderId) return;
    setPlacing(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentMethod: "Cash on Delivery" }),
      });
    } catch { /* still finish */ }
    finish(orderId);
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.product.slug, qty: l.qty, size: l.size, color: l.color, variant: l.variant })),
          shippingAddress: activeAddress,
          paymentMethod: method,
          couponCode: coupon?.code,
        }),
      });
      if (res.status === 401) { router.push("/sign-in"); return; }
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.persisted && data.orderId) {
        setOrderId(data.orderId);

        if (method === "Cash on Delivery") { finish(data.orderId); return; }

        // M-Pesa: only confirm the order once payment is verified.
        if (data.mpesa?.ok) {
          setPhase("awaiting");
          const paid = await pollPayment(data.orderId);
          if (paid) { finish(data.orderId); return; }
          setPhase("failed");
          setNotice("We couldn't confirm your M-Pesa payment yet. Complete the prompt on your phone and check again, or switch to Cash on Delivery.");
        } else {
          setPhase("failed");
          setNotice(`We couldn't start the M-Pesa prompt${data.mpesa?.reason ? ` (${data.mpesa.reason})` : ""}. You can pay on delivery instead.`);
        }
        return;
      }

      // Demo fallback (no database configured).
      const order = createOrder({
        items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, image: l.product.images[0], price: l.unitPrice, qty: l.qty, size: l.size, color: l.color, variant: l.variant })),
        shippingAddress: activeAddress, paymentMethod: method, subtotal, deliveryFee, discount, couponCode: coupon?.code, total,
      });
      finish(order.id);
    } finally {
      setPlacing(false);
    }
  };

  const recheck = async () => {
    if (!orderId) return;
    setPlacing(true);
    const r = await fetch(`/api/orders/${orderId}/payment-status`).then((x) => x.json()).catch(() => ({}));
    setPlacing(false);
    if (r.isPaid) finish(orderId);
    else setNotice("Still waiting on M-Pesa. Approve the prompt on your phone, then check again.");
  };

  // Awaiting / failed payment panel (replaces the form once an M-Pesa order is placed).
  if (phase !== "form") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:px-8">
        <span className={cn("mx-auto grid size-14 place-items-center rounded-full", phase === "awaiting" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/60")}>
          {phase === "awaiting" ? <Loader2 className="size-7 animate-spin" /> : <Smartphone className="size-7" />}
        </span>
        <h1 className="mt-5 font-serif text-2xl text-foreground">
          {phase === "awaiting" ? "Confirm payment on your phone" : "Payment not confirmed"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {phase === "awaiting"
            ? `Enter your M-Pesa PIN to pay ${formatKsh(grandTotal)}. This page will continue automatically once payment is received.`
            : notice}
        </p>
        {phase === "failed" && (
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={recheck} disabled={placing}>{placing ? "Checking…" : "I've paid — check again"}</Button>
            <Button variant="outline" onClick={switchToCOD} disabled={placing}>Switch to Cash on Delivery</Button>
          </div>
        )}
        {phase === "awaiting" && <p className="mt-6 text-xs text-muted-foreground">Didn&apos;t get a prompt? It can take a few seconds.</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Checkout</h1>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Shipping */}
          <section>
            <h2 className="mb-4 font-serif text-lg text-foreground">Delivery address</h2>

            {saved.length > 0 && (
              <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
                {saved.map((a) => (
                  <button
                    key={a._id}
                    onClick={() => setSelectedId(a._id)}
                    className={cn("rounded-xl border p-3 text-left text-sm transition-colors", selectedId === a._id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <MapPin className="size-3.5 text-primary" /> {a.label || a.fullName}
                      </span>
                      {selectedId === a._id && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="mt-1 text-muted-foreground">{a.street}, {a.area}, {a.city}</p>
                    <p className="text-muted-foreground">{a.phone}</p>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedId("new")}
                  className={cn("flex items-center justify-center gap-1.5 rounded-xl border border-dashed p-3 text-sm transition-colors", selectedId === "new" ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-foreground/30")}
                >
                  <Plus className="size-4" /> Use a new address
                </button>
              </div>
            )}

            {selectedId === "new" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full name"><Input value={form.fullName} onChange={set("fullName")} placeholder="e.g. Achieng Otieno" /></Field>
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div>
                  <Field label="Phone (M-Pesa)"><Input value={form.phone} onChange={set("phone")} placeholder="0712 345 678" inputMode="tel" /></Field>
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div>
                  <Field label="City"><Input value={form.city} onChange={set("city")} /></Field>
                  {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Field label="Street / building"><Input value={form.street} onChange={set("street")} placeholder="e.g. Moi Avenue, Bihi Towers" /></Field>
                  {errors.street && <p className="mt-1 text-xs text-destructive">{errors.street}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Field label="Area / estate"><Input value={form.area} onChange={set("area")} placeholder="e.g. CBD, Kilimani, Westlands" /></Field>
                  {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
                </div>
              </div>
            )}
          </section>

          {/* Payment */}
          <section>
            <h2 className="mb-4 font-serif text-lg text-foreground">Payment method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <MethodCard active={method === "Cash on Delivery"} onClick={() => setMethod("Cash on Delivery")} icon={<Banknote className="size-5" />} title="Cash on Delivery" desc="Pay the rider on arrival" recommended />
              <MethodCard active={method === "M-Pesa"} onClick={() => setMethod("M-Pesa")} icon={<Smartphone className="size-5" />} title="M-Pesa" desc="STK push to your phone" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {method === "M-Pesa"
                ? "You'll get an M-Pesa prompt — your order is confirmed once payment is received."
                : "Your order is placed now and you pay the rider on delivery."}
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-max rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">Your order</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 text-sm">
                <span className="text-foreground/90">{l.product.name} <span className="text-muted-foreground">× {l.qty}</span></span>
                <span className="whitespace-nowrap text-foreground">{formatKsh(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-foreground">{formatKsh(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount {coupon ? `(${coupon.code})` : ""}</dt><dd className="text-primary">− {formatKsh(discount)}</dd></div>}
            {shopDiscount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Shop discounts</dt><dd className="text-primary">− {formatKsh(shopDiscount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="text-foreground">{deliveryFee === 0 ? "Free" : formatKsh(deliveryFee)}</dd></div>
            {bagFee > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Shop bag fees</dt><dd className="text-foreground">{formatKsh(bagFee)}</dd></div>}
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground"><dt>Total</dt><dd>{formatKsh(grandTotal)}</dd></div>
          </dl>

          <Button onClick={placeOrder} disabled={placing} className="mt-5 w-full">
            <Lock className="size-4" /> {placing ? "Placing…" : `Place order · ${formatKsh(grandTotal)}`}
          </Button>
          <Link href="/cart" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}

function MethodCard({ active, onClick, icon, title, desc, recommended }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; recommended?: boolean }) {
  return (
    <button onClick={onClick} className={cn("relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors", active ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30")}>
      {recommended && <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-medium text-primary">Recommended</span>}
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", active ? "bg-primary/15 text-primary" : "bg-secondary text-foreground/60")}>{icon}</span>
      <span>
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}
