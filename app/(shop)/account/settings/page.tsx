"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { TwoFactorCard } from "@/components/account/two-factor-card";

type Profile = { name: string; email: string; phone?: string; twoFactorEnabled?: boolean };

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const d: Profile = await res.json();
          setProfile(d); setName(d.name ?? ""); setPhone(d.phone ?? ""); setTwoFA(Boolean(d.twoFactorEnabled));
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/user/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (res.ok) { setSavedProfile(true); setTimeout(() => setSavedProfile(false), 2000); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next.length < 6) return setPwMsg({ ok: false, text: "New password must be at least 6 characters." });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: "Passwords do not match." });
    const res = await fetch("/api/user/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setPwMsg({ ok: true, text: "Password updated." }); setPw({ current: "", next: "", confirm: "" }); }
    else setPwMsg({ ok: false, text: data?.error ?? "Could not update password." });
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">Profile</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{profile?.email}</p>
        <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></Field>
          <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="07xx xxx xxx" /></Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">{savedProfile ? <><Check className="size-4" /> Saved</> : "Save profile"}</Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">Password</h2>
        <form onSubmit={savePassword} className="mt-5 grid gap-4 sm:max-w-md">
          <Field label="Current password"><PasswordInput value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" /></Field>
          <Field label="New password"><PasswordInput value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" /></Field>
          <Field label="Confirm new password"><PasswordInput value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" /></Field>
          {pwMsg && <p className={pwMsg.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{pwMsg.text}</p>}
          <div><Button type="submit" size="sm">Update password</Button></div>
        </form>
      </section>

      <TwoFactorCard initialEnabled={twoFA} />
    </div>
  );
}
