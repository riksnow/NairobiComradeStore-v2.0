"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/store-context";

export function TwoFactorCard({ initialEnabled }: { initialEnabled: boolean }) {
  const { notify } = useStore();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState<"idle" | "setup" | "disable">("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const beginSetup = async () => {
    setError(null); setBusy(true);
    const res = await fetch("/api/user/2fa");
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d?.error ?? "Could not start setup."); return; }
    if (d.enabled) { setEnabled(true); return; }
    setQr(d.qr); setSecret(d.secret); setMode("setup"); setCode("");
  };

  const verifyEnable = async () => {
    setError(null); setBusy(true);
    const res = await fetch("/api/user/2fa", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: code }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d?.error ?? "Could not verify."); return; }
    setEnabled(true); setMode("idle"); setQr(null); setSecret(null); setCode("");
    notify("Two-factor authentication enabled");
  };

  const disable = async () => {
    setError(null); setBusy(true);
    const res = await fetch("/api/user/2fa", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: code }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d?.error ?? "Could not disable."); return; }
    setEnabled(false); setMode("idle"); setCode("");
    notify("Two-factor authentication disabled");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-lg text-foreground">
            <ShieldCheck className="size-5 text-primary" /> Two-factor authentication
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {enabled ? "Enabled — you'll enter a code from your authenticator app at sign-in." : "Protect your account with Google Authenticator or any TOTP app."}
          </p>
        </div>
        {mode === "idle" && (
          enabled
            ? <Button variant="outline" size="sm" onClick={() => { setMode("disable"); setCode(""); setError(null); }}>Disable</Button>
            : <Button size="sm" onClick={beginSetup} disabled={busy}>{busy ? "…" : "Enable"}</Button>
        )}
      </div>

      {mode === "setup" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          {qr && (
            <Image src={qr} alt="Scan with your authenticator app" width={160} height={160} className="rounded-lg border border-border bg-white p-2" unoptimized />
          )}
          <div className="space-y-3">
            <p className="inline-flex items-center gap-1.5 text-sm text-foreground"><Smartphone className="size-4 text-primary" /> Scan the QR code, then enter the 6-digit code.</p>
            {secret && (
              <p className="text-xs text-muted-foreground">Can&apos;t scan? Enter this key manually: <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">{secret}</code></p>
            )}
            <div className="flex gap-2 sm:max-w-xs">
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" />
              <Button onClick={verifyEnable} disabled={busy || code.trim().length < 6}>{busy ? "…" : "Verify"}</Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button onClick={() => { setMode("idle"); setError(null); }} className="text-xs text-foreground/60 hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {mode === "disable" && (
        <div className="mt-5 space-y-3 sm:max-w-xs">
          <p className="text-sm text-muted-foreground">Enter a current code to turn 2FA off.</p>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" />
            <Button variant="outline" onClick={disable} disabled={busy}>{busy ? "…" : "Disable"}</Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button onClick={() => { setMode("idle"); setError(null); }} className="text-xs text-foreground/60 hover:text-foreground">Cancel</button>
        </div>
      )}

      {mode === "idle" && error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
