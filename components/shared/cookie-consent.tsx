"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "ncs_cookie_consent_v1";

type Prefs = { necessary: true; analytics: boolean; marketing: boolean };

const ALL: Prefs = { necessary: true, analytics: true, marketing: true };
const MIN: Prefs = { necessary: true, analytics: false, marketing: false };

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customise, setCustomise] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(ALL);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const save = (p: Prefs) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...p, at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-4 p-5">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Cookie className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-lg text-foreground">We use cookies</h2>
              <button onClick={() => save(MIN)} aria-label="Dismiss" className="text-foreground/40 hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              We use cookies to keep you signed in, remember your cart, and understand how comrades use the
              store. Choose which to allow — necessary cookies are always on.
            </p>

            {customise && (
              <div className="mt-4 space-y-2.5">
                <Row label="Strictly necessary" desc="Sign-in, cart, and security. Always active." checked disabled />
                <Row
                  label="Analytics"
                  desc="Anonymous usage to help us improve."
                  checked={prefs.analytics}
                  onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                />
                <Row
                  label="Marketing"
                  desc="Personalised offers and promotions."
                  checked={prefs.marketing}
                  onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button size="sm" onClick={() => save(ALL)}>Accept all</Button>
              {customise ? (
                <Button size="sm" variant="outline" onClick={() => save(prefs)}>Save choices</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setCustomise(true)}>Customise</Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => save(MIN)}>Reject non-essential</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3.5 py-2.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"} ${disabled ? "opacity-60" : ""}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-card transition-all ${checked ? "left-[1.375rem]" : "left-0.5"}`} />
      </button>
    </label>
  );
}
