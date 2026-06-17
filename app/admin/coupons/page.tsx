"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatKsh, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/store/store-context";

type Coupon = { _id: string; code: string; type: "percentage" | "fixed"; value: number; minOrder: number; isActive: boolean };

export default function AdminCouponsPage() {
  const { notify } = useStore();
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", minOrder: "" });
  const [err, setErr] = useState<string | null>(null);

  const load = async () => { const r = await fetch("/api/admin/coupons"); if (r.ok) setItems(await r.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setErr(null);
    if (!form.code || !form.value) return setErr("Code and value are required.");
    const res = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.code, type: form.type, value: Number(form.value), minOrder: Number(form.minOrder || 0) }),
    });
    if (res.ok) { setOpen(false); notify(`Coupon ${form.code.toUpperCase()} created`); setForm({ code: "", type: "percentage", value: "", minOrder: "" }); await load(); }
    else { const d = await res.json().catch(() => ({})); setErr(d?.error ?? "Could not create."); }
  };
  const toggle = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
    if (res.ok) { setItems((l) => l.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x))); notify(c.isActive ? `${c.code} deactivated` : `${c.code} activated`); }
  };
  const del = async (id: string) => { if (!confirm("Delete coupon?")) return; const r = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" }); if (r.ok) { setItems((l) => l.filter((x) => x._id !== id)); notify("Coupon deleted"); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl text-foreground md:text-3xl">Coupons</h1><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} coupons`}</p></div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" /> New coupon</Button>
      </div>

      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Min order</th><th className="px-4 py-3 font-medium">Active</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{c.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.type === "percentage" ? `${c.value}%` : formatKsh(c.value)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.minOrder ? formatKsh(c.minOrder) : "—"}</td>
                  <td className="px-4 py-3"><button onClick={() => toggle(c)} className={cn("rounded-full px-2 py-0.5 text-xs", c.isActive ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/60")}>{c.isActive ? "Active" : "Off"}</button></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => del(c._id)} className="grid size-8 place-items-center rounded-md hover:bg-destructive/10" aria-label="Delete"><Trash2 className="size-4 text-destructive" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} label="New coupon">
        <h3 className="mb-4 font-serif text-lg text-foreground">New coupon</h3>
        <div className="space-y-3">
          <Field label="Code"><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="KARIBU10" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="eyebrow mb-2 block text-[0.6rem] text-muted-foreground">Type</span>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="h-12 w-full rounded-md border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none">
                <option value="percentage">Percentage (%)</option><option value="fixed">Fixed (Ksh)</option>
              </select>
            </div>
            <Field label="Value"><Input inputMode="numeric" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} /></Field>
          </div>
          <Field label="Minimum order (Ksh)"><Input inputMode="numeric" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} /></Field>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button onClick={create} className="w-full">Create coupon</Button>
        </div>
      </Dialog>
    </div>
  );
}
