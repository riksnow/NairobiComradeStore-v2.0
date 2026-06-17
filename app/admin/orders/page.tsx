"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Smartphone, CheckCircle2 } from "lucide-react";
import { formatKsh, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES, canTransition, type OrderStatus } from "@/lib/constants";
import { useStore } from "@/store/store-context";

type Order = {
  _id: string; total: number; status: OrderStatus; paymentMethod: string; isPaid: boolean;
  createdAt: string; items: { name: string; qty: number }[];
  user?: { name?: string; email?: string } | null;
};

export default function AdminOrdersPage() {
  const { notify } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const patch = (id: string) => orders.find((o) => o._id === id);

  const update = async (id: string, status: OrderStatus) => {
    setBusy(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (res.ok) { const o = await res.json(); setOrders((l) => l.map((x) => (x._id === id ? { ...x, status: o.status } : x))); notify(`Order moved to ${status}`); }
    else { const d = await res.json().catch(() => ({})); notify(d?.error ?? "Could not update."); }
    setBusy(null);
  };

  const markPaid = async (id: string) => {
    setBusy(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPaid: true }),
    });
    if (res.ok) { setOrders((l) => l.map((x) => (x._id === id ? { ...x, isPaid: true } : x))); notify("Marked as paid"); }
    else notify("Could not update.");
    setBusy(null);
  };

  const requestMpesa = async (id: string) => {
    setBusy(id);
    const res = await fetch(`/api/admin/orders/${id}/request-payment`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { notify(d?.error ?? "Could not send the M-Pesa prompt."); setBusy(null); return; }
    notify("M-Pesa prompt sent — waiting for the customer");
    // Light poll so the row flips to paid once confirmed.
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const s = await fetch(`/api/orders/${id}/payment-status`).then((x) => x.json()).catch(() => ({}));
      if (s.isPaid) { setOrders((l) => l.map((x) => (x._id === id ? { ...x, isPaid: true } : x))); notify("Payment received"); break; }
      if (patch(id) === undefined) break;
    }
    setBusy(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground md:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${orders.length} orders`}</p>
      </div>

      {!loading && orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-foreground/50"><ShoppingBag className="size-6" /></span>
          <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[860px] text-sm">
            <thead><tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th><th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Advance</th>
            </tr></thead>
            <tbody>
              {orders.map((o) => {
                const next = ORDER_STATUSES.filter((s) => canTransition(o.status, s));
                const isBusy = busy === o._id;
                const canPay = !o.isPaid && o.status !== "Cancelled";
                return (
                  <tr key={o._id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium"><Link href={`/admin/orders/${o._id}`} className="text-foreground hover:text-primary hover:underline">#{o._id.slice(-6).toUpperCase()}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground">{o.user?.name ?? "—"}<br /><span className="text-xs">{o.user?.email}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatKsh(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={o.isPaid ? "text-primary" : "text-muted-foreground"}>{o.isPaid ? "Paid" : "Unpaid"}</span>
                      {canPay && (
                        <div className="mt-1.5 flex flex-col gap-1">
                          <button disabled={isBusy} onClick={() => requestMpesa(o._id)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground/80 hover:bg-foreground/5 disabled:opacity-50">
                            <Smartphone className="size-3" /> Request M-Pesa
                          </button>
                          <button disabled={isBusy} onClick={() => markPaid(o._id)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground/80 hover:bg-foreground/5 disabled:opacity-50">
                            <CheckCircle2 className="size-3" /> Mark paid
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-xs", o.status === "Delivered" ? "bg-primary/10 text-primary" : o.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground/70")}>{o.status}</span></td>
                    <td className="px-4 py-3">
                      {next.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : (
                        <div className="flex flex-wrap gap-1.5">
                          {next.map((s) => {
                            const blocked = s === "Delivered" && !o.isPaid;
                            return (
                              <button key={s} disabled={isBusy || blocked} onClick={() => update(o._id, s)}
                                title={blocked ? "Payment must be received first" : undefined}
                                className={cn("rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-40",
                                  s === "Cancelled" ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-border text-foreground/80 hover:bg-foreground/5")}>
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
