"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, CheckCircle2, XCircle, Smartphone } from "lucide-react";
import { formatKsh, formatDateTime, cn } from "@/lib/utils";
import { ORDER_STATUSES, canTransition, type OrderStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/store-context";
import { ImageWithFallback } from "@/components/primitives/image-with-fallback";

type Order = {
  _id: string; total: number; subtotal: number; deliveryFee: number; discount: number; bagFee?: number; shopDiscount?: number;
  status: OrderStatus; paymentMethod: string; isPaid: boolean; createdAt: string; couponCode?: string;
  cancellationReason?: string;
  items: { name: string; qty: number; price: number; image: string; size?: string; color?: string; variant?: string; shop?: string; shopName?: string }[];
  shippingAddress: { fullName: string; phone: string; street: string; area: string; city: string };
  statusHistory: { status: string; timestamp: string; note?: string }[];
  user?: { name?: string; email?: string } | null;
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { notify } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const load = async () => {
    const res = await fetch(`/api/admin/orders/${params.id}`);
    if (res.ok) setOrder(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, [params.id]);

  const patch = async (body: Record<string, unknown>, okMsg: string) => {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${params.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setOrder(d); notify(okMsg); }
    else notify(d?.error ?? "Could not update order.");
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const requestMpesa = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${params.id}/request-payment`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { notify(d?.error ?? "Could not send the M-Pesa prompt."); return; }
    notify("M-Pesa prompt sent — waiting for the customer");
    for (let i = 0; i < 30; i++) {
      await sleep(3000);
      const s = await fetch(`/api/orders/${params.id}/payment-status`).then((x) => x.json()).catch(() => ({}));
      if (s.isPaid) { await load(); notify("Payment received"); return; }
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!order) return (
    <div className="rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">Order not found.</p>
      <Link href="/admin/orders" className="mt-3 inline-block text-sm text-primary hover:underline">Back to orders</Link>
    </div>
  );

  const cancelled = order.status === "Cancelled";
  const next = ORDER_STATUSES.filter((s) => canTransition(order.status, s));

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground">
        <ArrowLeft className="size-4" /> Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl text-foreground md:text-3xl">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)} · {order.paymentMethod}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs", cancelled ? "bg-destructive/10 text-destructive" : order.status === "Delivered" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/70")}>{order.status}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="divide-y divide-border rounded-2xl border border-border">
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

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg text-foreground">Status timeline</h2>
            <ol className="mt-4 space-y-3">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-foreground">{h.status}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(h.timestamp)}{h.note ? ` · ${h.note}` : ""}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="h-max space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            <Row label="Subtotal" value={formatKsh(order.subtotal)} />
            {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatKsh(order.discount)}`} />}
            {order.shopDiscount ? <Row label="Shop discounts" value={`− ${formatKsh(order.shopDiscount)}`} /> : null}
            {order.bagFee ? <Row label="Shop bag fees" value={formatKsh(order.bagFee)} /> : null}
            <Row label="Delivery" value={formatKsh(order.deliveryFee)} />
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground"><span>Total</span><span>{formatKsh(order.total)}</span></div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className={order.isPaid ? "text-primary" : "text-muted-foreground"}>{order.isPaid ? "Paid" : "Pending"}</span>
            </div>
            {!order.isPaid && !cancelled && (
              <div className="mt-3 space-y-2">
                <Button size="sm" variant="outline" className="w-full" disabled={busy} onClick={() => patch({ isPaid: true }, "Marked as paid")}>
                  <CheckCircle2 className="size-4" /> Mark as paid
                </Button>
                <Button size="sm" className="w-full" disabled={busy} onClick={requestMpesa}>
                  <Smartphone className="size-4" /> Request M-Pesa payment
                </Button>
                <p className="text-[0.7rem] text-muted-foreground">Sends an STK push to {order.shippingAddress.phone}. The order is marked paid automatically once confirmed.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground"><Package className="size-3.5" /> Customer</p>
            <p className="mt-2 text-sm text-foreground">{order.user?.name ?? order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
            <p className="mt-2 text-sm text-muted-foreground">{order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
          </div>

          {!cancelled && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Update status</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {next.filter((s) => s !== "Cancelled").map((s) => {
                  const blocked = s === "Delivered" && !order.isPaid;
                  return (
                    <Button key={s} size="sm" disabled={busy || blocked} title={blocked ? "Payment must be received first" : undefined} onClick={() => patch({ status: s }, `Order moved to ${s}`)}>{s}</Button>
                  );
                })}
              </div>
              {!order.isPaid && next.includes("Delivered") && (
                <p className="mt-2 text-xs text-muted-foreground">Delivered is locked until payment is received — request M-Pesa or mark the order paid first.</p>
              )}
              {next.includes("Cancelled") && (
                <div className="mt-4 border-t border-border pt-4">
                  <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for cancellation" />
                  <Button size="sm" variant="outline" className="mt-2 w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={busy} onClick={() => patch({ status: "Cancelled", note: reason || "Cancelled by admin" }, "Order cancelled")}>
                    <XCircle className="size-4" /> Cancel order
                  </Button>
                </div>
              )}
            </div>
          )}
          {cancelled && order.cancellationReason && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">Cancelled — {order.cancellationReason}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{value}</span></div>;
}
