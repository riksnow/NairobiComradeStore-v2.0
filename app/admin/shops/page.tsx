"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, Ban, Store } from "lucide-react";
import { cn, formatKsh } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/store/store-context";

type Shop = {
  _id: string; slug: string; name: string; blurb?: string; logo?: string; headerColor: string;
  bagFee: number; deliveryFee?: number; discountPct: number; isActive: boolean; isSuspended: boolean;
};
const empty = { name: "", slug: "", blurb: "", logo: "", headerColor: "#c96442", bagFee: "", deliveryFee: "", discountPct: "" };

export default function AdminShopsPage() {
  const { notify } = useStore();
  const [items, setItems] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { const r = await fetch("/api/admin/shops"); if (r.ok) setItems(await r.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setErr(null); setOpen(true); };
  const openEdit = (s: Shop) => {
    setEditing(s);
    setForm({ name: s.name, slug: s.slug, blurb: s.blurb ?? "", logo: s.logo ?? "", headerColor: s.headerColor || "#c96442",
      bagFee: String(s.bagFee ?? ""), deliveryFee: s.deliveryFee != null ? String(s.deliveryFee) : "", discountPct: String(s.discountPct ?? "") });
    setErr(null); setOpen(true);
  };

  const save = async () => {
    setErr(null);
    if (!form.name.trim()) return setErr("Shop name is required.");
    setBusy(true);
    const payload = {
      name: form.name, slug: form.slug || undefined, blurb: form.blurb, logo: form.logo, headerColor: form.headerColor,
      bagFee: Number(form.bagFee) || 0, deliveryFee: form.deliveryFee ? Number(form.deliveryFee) : undefined, discountPct: Number(form.discountPct) || 0,
    };
    const res = editing
      ? await fetch(`/api/admin/shops/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/shops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (res.ok) { setOpen(false); setForm(empty); setEditing(null); notify(editing ? "Shop updated" : "Shop created"); await load(); }
    else { const d = await res.json().catch(() => ({})); setErr(d?.error ?? "Could not save."); }
  };

  const patch = async (s: Shop, body: Record<string, unknown>, msg: string) => {
    const r = await fetch(`/api/admin/shops/${s._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { const u = await r.json(); setItems((l) => l.map((x) => (x._id === s._id ? { ...x, ...u } : x))); notify(msg); }
  };

  const del = async (s: Shop) => {
    if (!confirm(`Delete “${s.name}”? Its products stay but lose their shop link.`)) return;
    const r = await fetch(`/api/admin/shops/${s._id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setItems((l) => l.filter((x) => x._id !== s._id)); notify(d.productsAffected ? `Deleted — ${d.productsAffected} product(s) affected` : "Shop deleted"); }
    else notify(d?.error ?? "Could not delete.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl text-foreground md:text-3xl">Shops</h1><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} shops`}</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="size-4" /> New shop</Button>
      </div>

      {!loading && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <li key={s._id} className={cn("overflow-hidden rounded-xl border border-border bg-card", s.isSuspended && "opacity-60")}>
              <div className="h-14" style={{ backgroundColor: s.headerColor }} />
              <div className="-mt-8 px-4 pb-4">
                <div className="size-14 overflow-hidden rounded-full border-2 border-card bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.logo ? <img src={s.logo} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-muted-foreground"><Store className="size-5" /></span>}
                </div>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div><p className="font-medium text-foreground">{s.name}</p><p className="text-xs text-muted-foreground">/{s.slug}</p></div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs", s.isSuspended ? "bg-destructive/10 text-destructive" : s.isActive ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/60")}>
                    {s.isSuspended ? "Suspended" : s.isActive ? "Live" : "Hidden"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Bag {formatKsh(s.bagFee || 0)}{s.discountPct ? ` · ${s.discountPct}% off` : ""}{s.deliveryFee != null ? ` · delivery ${formatKsh(s.deliveryFee)}` : ""}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="size-3.5" /> Edit</Button>
                  {s.isActive
                    ? <Button size="sm" variant="outline" onClick={() => patch(s, { isActive: false }, "Shop hidden")}><EyeOff className="size-3.5" /> Hide</Button>
                    : <Button size="sm" variant="outline" onClick={() => patch(s, { isActive: true }, "Shop live")}><Eye className="size-3.5" /> Show</Button>}
                  <Button size="sm" variant="outline" className={s.isSuspended ? "" : "border-destructive/30 text-destructive hover:bg-destructive/10"}
                    onClick={() => patch(s, { isSuspended: !s.isSuspended }, s.isSuspended ? "Shop reinstated" : "Shop suspended")}>
                    <Ban className="size-3.5" /> {s.isSuspended ? "Reinstate" : "Suspend"}
                  </Button>
                  <button onClick={() => del(s)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-destructive/10" aria-label="Delete"><Trash2 className="size-4 text-destructive" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} label={editing ? "Edit shop" : "New shop"}>
        <h3 className="mb-4 font-serif text-lg text-foreground">{editing ? "Edit shop" : "New shop"}</h3>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. K-Thrift" /></Field>
          <Field label="Slug (optional)"><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto from name" /></Field>
          <Field label="Blurb"><Input value={form.blurb} onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))} /></Field>
          <Field label="Logo URL"><Input value={form.logo} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} /></Field>
          <div>
            <label className="eyebrow mb-1.5 block text-[0.6rem] text-muted-foreground">Header colour</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.headerColor} onChange={(e) => setForm((f) => ({ ...f, headerColor: e.target.value }))} className="h-10 w-14 cursor-pointer rounded-md border border-border bg-card" />
              <Input value={form.headerColor} onChange={(e) => setForm((f) => ({ ...f, headerColor: e.target.value }))} className="flex-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Bag fee (Ksh)"><Input inputMode="numeric" value={form.bagFee} onChange={(e) => setForm((f) => ({ ...f, bagFee: e.target.value }))} /></Field>
            <Field label="Delivery (Ksh)"><Input inputMode="numeric" value={form.deliveryFee} onChange={(e) => setForm((f) => ({ ...f, deliveryFee: e.target.value }))} placeholder="default" /></Field>
            <Field label="Discount %"><Input inputMode="numeric" value={form.discountPct} onChange={(e) => setForm((f) => ({ ...f, discountPct: e.target.value }))} /></Field>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button onClick={save} className="w-full" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create shop"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
