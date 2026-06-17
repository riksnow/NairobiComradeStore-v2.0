"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { categories as staticCategories } from "@/lib/catalog";
import { useCategories } from "@/lib/hooks/use-categories";
import { formatKsh, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/store/store-context";

type Product = {
  _id: string; name: string; category: string; brand?: string; description?: string;
  price: number; listPrice?: number; countInStock: number; images: string[];
  sizes: string[]; colors: string[]; isPublished: boolean; isFeatured: boolean;
  flashSale: boolean; flashSalePrice?: number;
};

const empty = {
  name: "", category: staticCategories[0]?.slug ?? "", brand: "", description: "",
  price: "", listPrice: "", countInStock: "", images: "", sizes: "", colors: "",
  isPublished: true, isFeatured: false, flashSale: false, flashSalePrice: "",
};

export default function AdminProductsPage() {
  const { notify } = useStore();
  const categories = useCategories();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((p) => `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(t)) : items;
  }, [items, q]);

  const openCreate = () => { setEditId(null); setForm({ ...empty }); setErr(null); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditId(p._id); setErr(null);
    setForm({
      name: p.name, category: p.category, brand: p.brand ?? "", description: p.description ?? "",
      price: String(p.price), listPrice: p.listPrice ? String(p.listPrice) : "",
      countInStock: String(p.countInStock), images: p.images.join(", "), sizes: p.sizes.join(", "),
      colors: p.colors.join(", "), isPublished: p.isPublished, isFeatured: p.isFeatured,
      flashSale: p.flashSale, flashSalePrice: p.flashSalePrice ? String(p.flashSalePrice) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    setErr(null);
    if (!form.name || !form.price || !form.category) return setErr("Name, price and category are required.");
    setSaving(true);
    const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const payload = {
      name: form.name, category: form.category, brand: form.brand || undefined, description: form.description,
      price: Number(form.price), listPrice: form.listPrice ? Number(form.listPrice) : undefined,
      countInStock: Number(form.countInStock || 0), images: list(form.images), sizes: list(form.sizes),
      colors: list(form.colors), isPublished: form.isPublished, isFeatured: form.isFeatured,
      flashSale: form.flashSale, flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
    };
    const res = await fetch(editId ? `/api/admin/products/${editId}` : "/api/admin/products", {
      method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (res.ok) { setOpen(false); notify(editId ? "Product updated" : "Product created"); await load(); }
    else { const d = await res.json().catch(() => ({})); setErr(d?.error ?? "Could not save."); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product? This also removes its reviews.")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) { setItems((l) => l.filter((p) => p._id !== id)); notify("Product deleted"); }
  };

  const togglePublish = async (p: Product) => {
    const res = await fetch(`/api/admin/products/${p._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !p.isPublished }),
    });
    if (res.ok) { setItems((l) => l.map((x) => (x._id === p._id ? { ...x, isPublished: !x.isPublished } : x))); notify(p.isPublished ? "Product unpublished" : "Product published"); }
  };

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} of {items.length}</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="size-4" /> Add product</Button>
      </div>

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[680px] text-sm">
            <thead><tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Published</th><th className="px-4 py-3 font-medium"></th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="size-10 shrink-0 rounded-md border border-border object-cover" />
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{catName(p.category)}</td>
                  <td className="px-4 py-3 text-foreground">{formatKsh(p.price)}</td>
                  <td className="px-4 py-3"><span className={cn(p.countInStock === 0 ? "text-destructive" : "text-foreground")}>{p.countInStock}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(p)} className={cn("rounded-full px-2 py-0.5 text-xs", p.isPublished ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/60")}>
                      {p.isPublished ? "Published" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="grid size-8 place-items-center rounded-md hover:bg-foreground/5" aria-label="Edit"><Pencil className="size-4 text-foreground/70" /></button>
                      <button onClick={() => del(p._id)} className="grid size-8 place-items-center rounded-md hover:bg-destructive/10" aria-label="Delete"><Trash2 className="size-4 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} label="Product" className="max-w-xl">
        <h3 className="mb-4 font-serif text-lg text-foreground">{editId ? "Edit product" : "Add product"}</h3>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="eyebrow mb-2 block text-[0.6rem] text-muted-foreground">Category</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="h-12 w-full rounded-md border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none">
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (Ksh)"><Input inputMode="numeric" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></Field>
            <Field label="List price"><Input inputMode="numeric" value={form.listPrice} onChange={(e) => setForm((f) => ({ ...f, listPrice: e.target.value }))} /></Field>
            <Field label="Stock"><Input inputMode="numeric" value={form.countInStock} onChange={(e) => setForm((f) => ({ ...f, countInStock: e.target.value }))} /></Field>
          </div>
          <Field label="Description"><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          <Field label="Image URLs (comma-separated)"><Input value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sizes (comma)"><Input value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} /></Field>
            <Field label="Colors (comma)"><Input value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} /></Field>
          </div>
          <div className="flex flex-wrap gap-4 pt-1 text-sm">
            <Check label="Published" checked={form.isPublished} onChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} />
            <Check label="Featured" checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
            <Check label="Flash sale" checked={form.flashSale} onChange={(v) => setForm((f) => ({ ...f, flashSale: v }))} />
          </div>
          {form.flashSale && (
            <Field label="Flash sale price (Ksh)"><Input inputMode="numeric" value={form.flashSalePrice} onChange={(e) => setForm((f) => ({ ...f, flashSalePrice: e.target.value }))} /></Field>
          )}
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button onClick={save} disabled={saving} className="w-full">{saving ? "Saving…" : editId ? "Save changes" : "Create product"}</Button>
        </div>
      </Dialog>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}
