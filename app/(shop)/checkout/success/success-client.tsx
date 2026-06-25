"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Smartphone, Banknote, Package } from "lucide-react";
import { useStore } from "@/store/store-context";
import { Button } from "@/components/ui/button";
import { formatKsh, formatDateTime } from "@/lib/utils";

type View = {
  id: string;
  date: string;
  paymentMethod: string;
  phone: string;
  fullName: string;
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

export function SuccessClient() {
  const sp = useSearchParams();
  const id = sp.get("order") ?? "";
  const { hydrated, getOrder } = useStore();
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    const local = getOrder(id);
    if (local) {
      setView({
        id: local.id, date: local.date, paymentMethod: local.paymentMethod,
        phone: local.shippingAddress.phone, fullName: local.shippingAddress.fullName,
        items: local.items.map((it) => ({ name: it.name, price: it.price, qty: it.qty })),
        subtotal: local.subtotal, discount: local.discount, deliveryFee: local.deliveryFee, total: local.total,
      });
      setLoading(false);
      return;
    }
    // Not in the client store → fetch the persisted order from the database.
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const o = await res.json();
          setView({
            id: o._id, date: o.createdAt, paymentMethod: o.paymentMethod,
            phone: o.shippingAddress?.phone ?? "", fullName: o.shippingAddress?.fullName ?? "comrade",
            items: (o.items ?? []).map((it: { name: string; price: number; qty: number }) => ({ name: it.name, price: it.price, qty: it.qty })),
            subtotal: o.subtotal, discount: o.discount, deliveryFee: o.deliveryFee, total: o.total,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, id, getOrder]);

  if (!hydrated || loading) return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;

  if (!view) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-2xl text-foreground">Order not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">We couldn&apos;t find that order.</p>
        <Button asChild className="mt-6"><Link href="/">Back home</Link></Button>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/12 text-primary">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-5 font-serif text-3xl text-foreground">Order confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks, {view.fullName.split(" ")[0]}! Your order{" "}
          <span className="font-medium text-foreground">#{view.id.slice(-6).toUpperCase()}</span> was placed on {formatDateTime(view.date)}.
        </p>
      </div>

      <div className="mx-auto mt-7 max-w-md rounded-xl border border-border bg-card p-4 text-sm">
        {view.paymentMethod === "M-Pesa" ? (
          <p className="flex items-start gap-2 text-foreground/90">
            <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />
            An M-Pesa STK push was sent to <strong className="mx-1 font-medium">{view.phone}</strong> to confirm {formatKsh(view.total)}.
          </p>
        ) : (
          <p className="flex items-start gap-2 text-foreground/90">
            <Banknote className="mt-0.5 size-4 shrink-0 text-primary" />
            Pay <strong className="mx-1 font-medium">{formatKsh(view.total)}</strong> in cash when your order arrives.
          </p>
        )}
      </div>

      <div className="mx-auto mt-5 max-w-md rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 inline-flex items-center gap-2 font-serif text-lg text-foreground">
          <Package className="size-4 text-primary" /> Summary
        </h2>
        <ul className="space-y-2 text-sm">
          {view.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-foreground/90">{it.name} <span className="text-muted-foreground">× {it.qty}</span></span>
              <span className="whitespace-nowrap text-foreground">{formatKsh(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-foreground">{formatKsh(view.subtotal)}</dd></div>
          {view.discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="text-primary">− {formatKsh(view.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="text-foreground">{formatKsh(view.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground"><dt>Total</dt><dd>{formatKsh(view.total)}</dd></div>
        </dl>
      </div>

      <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1"><Link href="/account/orders">View my orders</Link></Button>
        <Button asChild variant="outline" className="flex-1"><Link href="/search">Keep shopping</Link></Button>
      </div>
    </div>
  );
}
