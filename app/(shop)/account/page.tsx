"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Package, MapPin, Bell, Settings, ChevronRight } from "lucide-react";
import { formatKsh, formatDate } from "@/lib/utils";

type Order = { _id: string; total: number; status: string; createdAt: string };

const TILES = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountOverviewPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orders");
      if (res.ok) setOrders(await res.json());
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="font-serif text-2xl text-foreground">{session?.user?.name ?? "Comrade"}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
              <Icon className="size-5 text-primary" />
              <p className="mt-2 text-sm font-medium text-foreground">{t.label}</p>
            </Link>
          );
        })}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-foreground">Recent orders</h2>
          <Link href="/account/orders" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="space-y-2">
            {orders.slice(0, 4).map((o) => (
              <li key={o._id}>
                <Link href={`/account/orders/${o._id}`} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40">
                  <span className="text-sm text-foreground">#{o._id.slice(-6).toUpperCase()}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span>
                  <span className="text-sm font-medium text-foreground">{formatKsh(o.total)}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
