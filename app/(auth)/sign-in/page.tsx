"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { GoogleButton } from "../google-button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 1) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);

    // Step 1: verify credentials and find out if a 2FA code is needed.
    const pre = await fetch("/api/auth/precheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()).catch(() => ({ ok: false }));

    if (!pre.ok) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    if (pre.twoFactorRequired && !showCode) {
      setShowCode(true);
      setError("Enter the 6-digit code from your authenticator app.");
      setLoading(false);
      return;
    }
    if (pre.twoFactorRequired && code.trim().length < 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      setLoading(false);
      return;
    }

    // Step 2: real sign-in (re-checks password + TOTP server-side).
    const res = await signIn("credentials", {
      email,
      password,
      token: code.trim() || undefined,
      redirect: false,
    });
    if (res?.error) {
      setError(pre.twoFactorRequired ? "That code is incorrect. Try again." : "Invalid email or password.");
      setLoading(false);
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-7 shadow-xl backdrop-blur sm:p-9">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your comrade account.</p>
      </div>

      <div className="mt-7">
        <GoogleButton label="Continue with Google" />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow text-[0.6rem] text-muted-foreground">Password</span>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </div>

        {showCode ? (
          <Field label="Authenticator code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="6-digit code" />
          </Field>
        ) : (
          <button type="button" onClick={() => setShowCode(true)} className="text-xs text-foreground/70 hover:text-foreground">
            Use an authenticator code
          </button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
