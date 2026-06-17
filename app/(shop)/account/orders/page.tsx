"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { formatKsh, formatDate, cn } from "@/lib/utils";

type Order = {
  _id: string; total: number; status: string; paymentMethod: string;
  createdAt: string; items: { name: string; qty: number; image: string }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orders");
      if (res.ok) setOrders(await res.json());
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-foreground/50"><Package className="size-6" /></span>
        <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
        <Link href="/search" className="mt-3 inline-block text-sm text-primary hover:underline">Start shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-serif text-xl text-foreground">Orders</h2>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o._id}>
            <Link href={`/account/orders/${o._id}`} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">#{o._id.slice(-6).toUpperCase()}</span>
                  <StatusPill status={o.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"} · {o.paymentMethod}
                </p>
              </div>
              <span className="font-medium text-foreground">{formatKsh(o.total)}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs",
      status === "Delivered" ? "bg-primary/10 text-primary" : status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground/70")}>
      {status}
    </span>
  );
}
