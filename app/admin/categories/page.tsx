"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/store/store-context";

type Category = { _id: string; slug: string; name: string; blurb?: string; image?: string; order: number; isActive: boolean };
const empty = { name: "", slug: "", blurb: "", image: "" };

export default function AdminCategoriesPage() {
  const { notify } = useStore();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { const r = await fetch("/api/admin/categories"); if (r.ok) setItems(await r.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setErr(null); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, blurb: c.blurb ?? "", image: c.image ?? "" }); setErr(null); setOpen(true); };

  const save = async () => {
    setErr(null);
    if (!form.name.trim()) return setErr("Name is required.");
    setBusy(true);
    const res = editing
      ? await fetch(`/api/admin/categories/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) { setOpen(false); setForm(empty); setEditing(null); notify(editing ? "Category updated" : "Category created"); await load(); }
    else { const d = await res.json().catch(() => ({})); setErr(d?.error ?? "Could not save."); }
  };

  const toggle = async (c: Category) => {
    const r = await fetch(`/api/admin/categories/${c._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
    if (r.ok) { setItems((l) => l.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x))); notify(c.isActive ? `${c.name} hidden from the site` : `${c.name} is now live`); }
  };

  const del = async (c: Category) => {
    if (!confirm(`Delete “${c.name}”? Products in this category keep their tag but it won't show on the site.`)) return;
    const r = await fetch(`/api/admin/categories/${c._id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setItems((l) => l.filter((x) => x._id !== c._id)); notify(d.productsAffected ? `Deleted — ${d.productsAffected} product(s) were in it` : "Category deleted"); }
    else notify(d?.error ?? "Could not delete.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl text-foreground md:text-3xl">Categories</h1><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} categories`}</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="size-4" /> New category</Button>
      </div>

      {!loading && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c._id} className="overflow-hidden rounded-xl border border-border bg-card">
              {c.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={c.image} alt="" className="h-28 w-full object-cover" />
                : <div className="h-28 w-full bg-secondary" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs", c.isActive ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/60")}>{c.isActive ? "Live" : "Hidden"}</span>
                </div>
                {c.blurb && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.blurb}</p>}
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  {c.isActive ? (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toggle(c)}><EyeOff className="size-4" /> Deactivate</Button>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={() => toggle(c)}><Eye className="size-4" /> Activate</Button>
                  )}
                  <button onClick={() => openEdit(c)} className="grid size-9 place-items-center rounded-md border border-border hover:bg-accent" aria-label="Edit"><Pencil className="size-4 text-foreground/70" /></button>
                  <button onClick={() => del(c)} className="grid size-9 place-items-center rounded-md border border-border hover:bg-destructive/10" aria-label="Delete"><Trash2 className="size-4 text-destructive" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} label={editing ? "Edit category" : "New category"}>
        <h3 className="mb-4 font-serif text-lg text-foreground">{editing ? "Edit category" : "New category"}</h3>
        <div className="space-y-3">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Gaming" /></Field>
          <Field label="Slug (optional)"><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto from name" /></Field>
          <Field label="Blurb"><Input value={form.blurb} onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))} placeholder="Short tagline shown on the site" /></Field>
          <Field label="Image URL"><Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} /></Field>
          {form.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="" className="h-28 w-full rounded-lg border border-border object-cover" />
          )}
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button onClick={save} className="w-full" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create category"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
