"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { GoogleButton } from "../google-button";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.includes("@") || form.password.length < 6) {
      setError("Fill in your name, a valid email, and a password (6+ characters).");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error ?? "Could not create your account.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-6 shadow-xl backdrop-blur sm:p-7">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Join the comrades</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create an account to shop faster.</p>
      </div>

      <div className="mt-5">
        <GoogleButton label="Sign up with Google" />
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Field label="Full name">
          <Input value={form.name} onChange={set("name")} placeholder="Wanjiku Otieno" autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Phone (optional)">
          <Input value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="07xx xxx xxx" autoComplete="tel" />
        </Field>
        <Field label="Password">
          <PasswordInput value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete="new-password" />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
