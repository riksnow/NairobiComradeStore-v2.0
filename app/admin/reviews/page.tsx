"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useStore } from "@/store/store-context";

type Review = {
  _id: string; name: string; rating: number; comment: string; isApproved: boolean; createdAt: string;
  product?: { name?: string; slug?: string } | null;
};

export default function AdminReviewsPage() {
  const { notify } = useStore();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/reviews");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (id: string, isApproved: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isApproved }) });
    if (res.ok) { setItems((l) => l.map((r) => (r._id === id ? { ...r, isApproved } : r))); notify(isApproved ? "Review approved" : "Review hidden"); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) { setItems((l) => l.filter((r) => r._id !== id)); notify("Review deleted"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground md:text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} reviews`}</p>
      </div>

      {!loading && (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="inline-flex items-center gap-0.5 text-primary">{r.rating}<Star className="size-3.5 fill-current" /></span>
                    {!r.isApproved && <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] text-foreground/60">Pending</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">on {r.product?.name ?? "product"} · {formatDate(r.createdAt)}</p>
                  <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => approve(r._id, !r.isApproved)} className={cn("rounded-md border px-2.5 py-1 text-xs", r.isApproved ? "border-border text-foreground/70 hover:bg-foreground/5" : "border-primary/30 text-primary hover:bg-primary/10")}>
                    {r.isApproved ? "Unapprove" : "Approve"}
                  </button>
                  <button onClick={() => del(r._id)} className="rounded-md border border-destructive/30 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
