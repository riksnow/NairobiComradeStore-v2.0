"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setSent(true);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-7 shadow-xl backdrop-blur sm:p-9">
      <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>

      {sent ? (
        <div className="mt-6 text-center">
          <h1 className="font-serif text-2xl text-foreground">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <span className="text-foreground">{email}</span>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <h1 className="font-serif text-2xl text-foreground">Reset your password</h1>
            <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a secure reset link.</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        </>
      )}
    </div>
  );
}
