"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/store/store-context";

type Banner = { _id: string; title: string; subtitle?: string; image: string; link?: string; isActive: boolean };
const empty = { title: "", subtitle: "", image: "", link: "" };

export default function AdminBannersPage() {
  const { notify } = useStore();
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { const r = await fetch("/api/admin/banners"); if (r.ok) setItems(await r.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setErr(null); setOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle ?? "", image: b.image, link: b.link ?? "" }); setErr(null); setOpen(true); };

  const save = async () => {
    setErr(null);
    if (!form.title || !form.image) return setErr("Title and image URL are required.");
    setBusy(true);
    const res = editing
      ? await fetch(`/api/admin/banners/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) {
      setOpen(false); setForm(empty);
      notify(editing ? "Banner updated" : "Banner created");
      setEditing(null);
      await load();
    } else { const d = await res.json().catch(() => ({})); setErr(d?.error ?? "Could not save."); }
  };

  const toggle = async (b: Banner) => {
    const r = await fetch(`/api/admin/banners/${b._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) });
    if (r.ok) { setItems((l) => l.map((x) => (x._id === b._id ? { ...x, isActive: !x.isActive } : x))); notify(b.isActive ? "Banner hidden" : "Banner activated"); }
  };

  const del = async (b: Banner) => {
    if (!confirm("Delete this banner?")) return;
    const r = await fetch(`/api/admin/banners/${b._id}`, { method: "DELETE" });
    if (r.ok) { setItems((l) => l.filter((x) => x._id !== b._id)); notify(`Deleted “${b.title}”`); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl text-foreground md:text-3xl">Banners</h1><p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} banners`}</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="size-4" /> New banner</Button>
      </div>

      {!loading && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((b) => (
            <li key={b._id} className="overflow-hidden rounded-xl border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-medium text-foreground">{b.title}</p>{b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}</div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs", b.isActive ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/60")}>{b.isActive ? "Active" : "Inactive"}</span>
                </div>
                {b.link && <p className="mt-2 truncate text-xs text-muted-foreground">{b.link}</p>}
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  {b.isActive ? (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toggle(b)}>
                      <EyeOff className="size-4" /> Deactivate
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={() => toggle(b)}>
                      <Eye className="size-4" /> Activate
                    </Button>
                  )}
                  <button onClick={() => openEdit(b)} className="grid size-9 place-items-center rounded-md border border-border hover:bg-accent" aria-label="Edit"><Pencil className="size-4 text-foreground/70" /></button>
                  <button onClick={() => del(b)} className="grid size-9 place-items-center rounded-md border border-border hover:bg-destructive/10" aria-label="Delete"><Trash2 className="size-4 text-destructive" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} label={editing ? "Edit banner" : "New banner"}>
        <h3 className="mb-4 font-serif text-lg text-foreground">{editing ? "Edit banner" : "New banner"}</h3>
        <div className="space-y-3">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Subtitle"><Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} /></Field>
          <Field label="Image URL"><Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} /></Field>
          <Field label="Link"><Input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/search" /></Field>
          {form.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="" className="h-28 w-full rounded-lg border border-border object-cover" />
          )}
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button onClick={save} className="w-full" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create banner"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
