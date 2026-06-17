"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error ?? "Could not reset your password.");
      setLoading(false);
      return;
    }
    router.push("/sign-in");
  };

  if (!token || !email) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-7 text-center shadow-xl backdrop-blur">
        <h1 className="font-serif text-2xl text-foreground">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">This reset link is missing information.</p>
        <Button asChild className="mt-5"><Link href="/forgot-password">Request a new link</Link></Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-7 shadow-xl backdrop-blur sm:p-8">
      <h1 className="font-serif text-2xl text-foreground">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">For {email}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="New password"><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
        <Field label="Confirm password"><PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></Field>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving…" : "Reset password"}</Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
