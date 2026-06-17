"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Lock } from "lucide-react";
import type { Review } from "@/lib/catalog";
import { cn, formatDate } from "@/lib/utils";
import { Stars } from "@/components/shared/stars";
import { Button } from "@/components/ui/button";

export function ReviewsSection({
  initial,
  avgRating,
  productSlug,
}: {
  initial: Review[];
  avgRating: number;
  productSlug: string;
}) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Eligibility — only customers who've ordered the product can review it.
  const [eligible, setEligible] = useState<{ canReview: boolean; reason?: string; hasReviewed?: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/products/${productSlug}/can-review`);
        if (res.ok) setEligible(await res.json());
        else setEligible({ canReview: false, reason: "signin" });
      } catch {
        setEligible({ canReview: false, reason: "error" });
      }
    })();
  }, [productSlug]);

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : avgRating;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));

  const submit = async () => {
    if (!comment.trim()) { setError("Please write a short comment."); return; }
    setSubmitting(true); setError(null);
    const res = await fetch(`/api/products/${productSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment.trim() }),
    });
    const d = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) { setError(d?.error ?? "Could not submit your review."); return; }
    setDone(true); setComment(""); setRating(5); setOpen(false);
    setEligible((e) => (e ? { ...e, hasReviewed: true } : e));
  };

  const gate = (() => {
    if (!eligible) return null;
    if (eligible.canReview) return null;
    if (eligible.reason === "signin")
      return (
        <p className="mt-6 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link> to review products you&apos;ve ordered.
        </p>
      );
    return (
      <p className="mt-6 inline-flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" /> Only customers who have ordered this product can leave a review.
      </p>
    );
  })();

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
        {/* Aggregate */}
        <div className="lg:w-64 lg:shrink-0">
          <h2 className="font-serif text-2xl text-foreground">Reviews</h2>
          {count === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-serif text-4xl text-foreground">{avg.toFixed(1)}</span>
                <div>
                  <Stars rating={avg} />
                  <p className="mt-1 text-xs text-muted-foreground">{count} review{count > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {breakdown.map((b) => (
                  <div key={b.star} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex w-8 items-center gap-0.5">{b.star}<Star className="size-3 fill-primary text-primary" /></span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${count ? (b.n / count) * 100 : 0}%` }} />
                    </div>
                    <span className="w-5 text-right">{b.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {eligible?.canReview ? (
            <Button variant="outline" className="mt-6 w-full" onClick={() => { setOpen((o) => !o); setError(null); }}>
              {open ? "Cancel" : eligible.hasReviewed ? "Edit your review" : "Write a review"}
            </Button>
          ) : gate}
          {done && !open && <p className="mt-3 text-xs text-primary">Thanks — your review was submitted for moderation.</p>}
        </div>

        {/* Form + list */}
        <div className="flex-1">
          {open && eligible?.canReview && (
            <div className="mb-8 rounded-md border border-border bg-card p-5">
              <p className="eyebrow mb-3 text-[0.55rem] text-muted-foreground">Your rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                    <Star className={cn("size-6", i <= rating ? "fill-primary text-primary" : "text-border")} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <textarea
                  placeholder="Share your thoughts…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</Button>
                <p className="text-xs text-muted-foreground">Posted as your account name. Reviews appear after moderation.</p>
              </div>
            </div>
          )}

          {count === 0 ? (
            <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No reviews yet.</div>
          ) : (
            <ul className="space-y-6">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
                  </div>
                  <Stars rating={r.rating} size={13} className="mt-1.5" />
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
