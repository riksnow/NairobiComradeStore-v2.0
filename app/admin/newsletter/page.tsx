"use client";

import { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useStore } from "@/store/store-context";

export default function AdminNewsletterPage() {
  const { notify } = useStore();
  const [count, setCount] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => { const r = await fetch("/api/admin/newsletter"); if (r.ok) { const d = await r.json(); setCount(d.count); } })();
  }, []);

  const send = async () => {
    if (!subject || !message) { setResult("Subject and message are required."); return; }
    setSending(true); setResult(null);
    const res = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setResult(`Sent to ${d.sent} of ${d.attempted} subscribers.`); notify(`Newsletter sent to ${d.sent} subscriber${d.sent === 1 ? "" : "s"}`); setSubject(""); setMessage(""); }
    else setResult(d?.error ?? "Could not send.");
    setSending(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground md:text-3xl">Newsletter</h1>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-4" /> {count === null ? "Loading…" : `${count} subscribers`}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg text-foreground">Compose a broadcast</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Sends an email to every subscriber via Resend.</p>
        <div className="mt-5 space-y-3">
          <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="New drops just landed" /></Field>
          <div>
            <span className="eyebrow mb-2 block text-[0.6rem] text-muted-foreground">Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Write your message to the comrades…" />
          </div>
          {result && <p className="text-sm text-primary">{result}</p>}
          <Button onClick={send} disabled={sending}><Send className="size-4" /> {sending ? "Sending…" : "Send broadcast"}</Button>
        </div>
      </div>
    </div>
  );
}
