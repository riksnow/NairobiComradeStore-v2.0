"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { formatKsh, formatDateTime, cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

type Order = {
  _id: string; total: number; subtotal: number; deliveryFee: number; discount: number; bagFee?: number; shopDiscount?: number;
  status: string; paymentMethod: string; isPaid: boolean; createdAt: string; couponCode?: string;
  cancellationReason?: string;
  items: { name: string; qty: number; price: number; image: string; size?: string; color?: string; variant?: string; shop?: string; shopName?: string }[];
  shippingAddress: { fullName: string; phone: string; street: string; area: string; city: string };
  statusHistory: { status: string; timestamp: string; note?: string }[];
};

const FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) setOrder(await res.json());
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!order) return (
    <div className="rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">Order not found.</p>
      <Link href="/account/orders" className="mt-3 inline-block text-sm text-primary hover:underline">Back to orders</Link>
    </div>
  );

  const cancelled = order.status === "Cancelled";
  const currentStep = FLOW.indexOf(order.status);

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground">
        <ArrowLeft className="size-4" /> Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-xl text-foreground">Order #{order._id.slice(-6).toUpperCase()}</h2>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs",
          cancelled ? "bg-destructive/10 text-destructive" : order.status === "Delivered" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/70")}>
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)} · {order.paymentMethod} · {order.isPaid ? "Paid" : "Payment pending"}</p>

      {!cancelled && (
        <div className="mt-6 flex items-center">
          {FLOW.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <span className={cn("grid size-8 place-items-center rounded-full text-xs", i <= currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/50")}>{i + 1}</span>
                <span className="mt-1 text-[0.7rem] text-muted-foreground">{s}</span>
              </div>
              {i < FLOW.length - 1 && <div className={cn("mx-1 h-0.5 flex-1", i < currentStep ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>
      )}
      {cancelled && order.cancellationReason && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">Cancelled — {order.cancellationReason}</p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="divide-y divide-border rounded-xl border border-border">
          {order.items.map((it, i) => (
            <div key={i} className="flex gap-3 p-4">
              <ImageWithFallback src={it.image} alt={it.name} wrapperClassName="size-16 shrink-0 rounded-md border border-border" sizes="80px" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{it.name}</p>
                <p className="text-xs text-muted-foreground">{[it.variant, it.size, it.color].filter(Boolean).join(" · ")} · Qty {it.qty}</p>
                {it.shopName && <p className="mt-0.5 text-[0.7rem] text-primary">Sold by {it.shopName}</p>}
              </div>
              <span className="text-sm text-foreground">{formatKsh(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        <aside className="h-max space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <Row label="Subtotal" value={formatKsh(order.subtotal)} />
            {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatKsh(order.discount)}`} />}
            {order.shopDiscount ? <Row label="Shop discounts" value={`− ${formatKsh(order.shopDiscount)}`} /> : null}
            {order.bagFee ? <Row label="Shop bag fees" value={formatKsh(order.bagFee)} /> : null}
            <Row label="Delivery" value={formatKsh(order.deliveryFee)} />
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground">
              <span>Total</span><span>{formatKsh(order.total)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground"><Package className="size-3.5" /> Delivery to</p>
            <p className="mt-2 text-sm text-foreground">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{value}</span></div>;
}
