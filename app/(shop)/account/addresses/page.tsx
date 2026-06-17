"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";

type Address = {
  _id: string; label?: string; fullName: string; phone: string;
  street: string; area: string; city: string; isDefault: boolean;
};
const blank = { label: "", fullName: "", phone: "", street: "", area: "", city: "Nairobi" };

export default function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/user/address");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = async () => {
    if (!form.fullName || !form.phone || !form.street || !form.area) return;
    setSaving(true);
    const res = await fetch("/api/user/address", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { setItems(await res.json()); setOpen(false); setForm(blank); }
    setSaving(false);
  };

  const makeDefault = async (id: string) => {
    const res = await fetch(`/api/user/address/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setDefault: true }),
    });
    if (res.ok) setItems(await res.json());
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/user/address/${id}`, { method: "DELETE" });
    if (res.ok) setItems(await res.json());
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Addresses</h2>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" /> Add address</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-foreground/50"><MapPin className="size-6" /></span>
          <p className="mt-4 text-sm text-muted-foreground">No saved addresses yet.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <li key={a._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    {a.fullName}
                    {a.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] text-primary">Default</span>}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.street}, {a.area}, {a.city}</p>
                  <p className="text-sm text-muted-foreground">{a.phone}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-3 text-xs">
                {!a.isDefault && (
                  <button onClick={() => makeDefault(a._id)} className="inline-flex items-center gap-1 text-foreground/70 hover:text-primary"><Star className="size-3.5" /> Set default</button>
                )}
                <button onClick={() => remove(a._id)} className="inline-flex items-center gap-1 text-foreground/70 hover:text-destructive"><Trash2 className="size-3.5" /> Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} label="Add address">
        <h3 className="mb-4 font-serif text-lg text-foreground">Add address</h3>
        <div className="space-y-3">
          <Field label="Label (optional)"><Input value={form.label} onChange={set("label")} placeholder="Home, Hostel…" /></Field>
          <Field label="Full name"><Input value={form.fullName} onChange={set("fullName")} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={set("phone")} inputMode="tel" /></Field>
          <Field label="Street / building"><Input value={form.street} onChange={set("street")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area"><Input value={form.area} onChange={set("area")} /></Field>
            <Field label="City"><Input value={form.city} onChange={set("city")} /></Field>
          </div>
          <Button onClick={add} disabled={saving} className="w-full">{saving ? "Saving…" : <><Check className="size-4" /> Save address</>}</Button>
        </div>
      </Dialog>
    </div>
  );
}
