"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Package, Megaphone, Info, Star, CheckCheck } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type Notif = {
  _id: string; type: "order" | "promotion" | "system" | "review";
  title: string; message: string; link?: string; isRead: boolean; createdAt: string;
};
const ICON = { order: Package, promotion: Megaphone, system: Info, review: Star } as const;

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const unread = items.filter((n) => !n.isRead).length;

  const load = async () => {
    const res = await fetch("/api/user/notifications");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markOne = async (id: string) => {
    setItems((l) => l.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    await fetch("/api/user/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };
  const markAll = async () => {
    setItems((l) => l.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/user/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">
          Notifications {unread > 0 && <span className="ml-1 text-sm text-primary">({unread} new)</span>}
        </h2>
        {unread > 0 && (
          <button onClick={markAll} className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground">
            <CheckCheck className="size-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-foreground/50"><Bell className="size-6" /></span>
          <p className="mt-4 text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((n) => {
            const Icon = ICON[n.type] ?? Info;
            const body = (
              <div className={cn("flex gap-3.5 rounded-xl border p-4 transition-colors", n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary/[0.04]")}>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", n.isRead ? "bg-secondary text-foreground/50" : "bg-primary/15 text-primary")}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground/80">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            );
            return (
              <li key={n._id} onMouseDown={() => !n.isRead && markOne(n._id)}>
                {n.link ? <Link href={n.link}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
