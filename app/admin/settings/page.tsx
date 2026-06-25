"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useStore } from "@/store/store-context";

type Settings = { storeName?: string; supportPhone?: string; supportEmail?: string; address?: string; whatsapp?: string; instagram?: string };

export default function AdminSettingsPage() {
  const { notify } = useStore();
  const [s, setS] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => { const r = await fetch("/api/admin/settings"); if (r.ok) setS(await r.json()); setLoading(false); })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    if (res.ok) { setSaved(true); notify("Store settings saved"); setTimeout(() => setSaved(false), 2000); }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">Store settings</h1>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <Field label="Store name"><Input value={s.storeName ?? ""} onChange={(e) => setS((x) => ({ ...x, storeName: e.target.value }))} /></Field>
        <Field label="Support phone"><Input value={s.supportPhone ?? ""} onChange={(e) => setS((x) => ({ ...x, supportPhone: e.target.value }))} /></Field>
        <Field label="Support email"><Input value={s.supportEmail ?? ""} onChange={(e) => setS((x) => ({ ...x, supportEmail: e.target.value }))} /></Field>
        <Field label="Address"><Input value={s.address ?? ""} onChange={(e) => setS((x) => ({ ...x, address: e.target.value }))} /></Field>
        <Field label="WhatsApp (number or wa.me link)"><Input value={s.whatsapp ?? ""} onChange={(e) => setS((x) => ({ ...x, whatsapp: e.target.value }))} placeholder="2547XXXXXXXX" /></Field>
        <Field label="Instagram (handle or URL)"><Input value={s.instagram ?? ""} onChange={(e) => setS((x) => ({ ...x, instagram: e.target.value }))} placeholder="nairobicomradestore" /></Field>
        <Button type="submit">{saved ? <><Check className="size-4" /> Saved</> : "Save settings"}</Button>
      </form>
    </div>
  );
}
