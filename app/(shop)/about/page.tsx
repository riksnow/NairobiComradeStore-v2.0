import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, HeartHandshake, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/shared/social-links";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "About — NairobiComradeStore",
  description:
    "NairobiComradeStore is built by comrades, for comrades across Kenyan universities, colleges and learning institutions.",
};

const VALUES = [
  { icon: GraduationCap, title: "Built for campus", body: "Kit, tech and essentials chosen for student life — from the lecture hall to the hostel." },
  { icon: HeartHandshake, title: "By comrades, for comrades", body: "Made by students who know the hustle, the budget, and what actually matters." },
  { icon: Truck, title: "Delivered across Nairobi", body: "Quick delivery wherever you are, with a flat, honest delivery fee." },
  { icon: ShieldCheck, title: "Pay your way", body: "M-Pesa or Cash on Delivery, secure checkout, and prices always in Ksh." },
];

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 md:px-8">
      <p className="eyebrow text-[0.65rem] text-primary">Our story</p>
      <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">By comrades, for comrades.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        NairobiComradeStore was started to serve the people who keep campus life moving — students across Kenya&apos;s
        universities, colleges and learning institutions. We bring fashion, shoes, electronics, home essentials, beauty
        and sports gear together in one place, at prices that respect a student budget, delivered right across Nairobi.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <h2 className="mt-4 font-serif text-lg text-foreground">{v.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid items-center gap-8 rounded-3xl border border-border bg-secondary/40 p-8 md:grid-cols-[160px_1fr] md:p-10">
        <div className="mx-auto grid size-36 place-items-center rounded-2xl border border-dashed border-border bg-card text-center text-xs text-muted-foreground">
          Photo coming soon
        </div>
        <div>
          <p className="eyebrow text-[0.6rem] text-muted-foreground">The creator</p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">KenyanGhost</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            NairobiComradeStore is the work of <span className="text-foreground">KenyanGhost</span> — a comrade building
            tools and stores for fellow students. The mission is simple: make good things easy to find and affordable for
            every comrade, wherever they&apos;re studying in Kenya.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[0.6rem] text-muted-foreground">Say hi</p>
          <h2 className="mt-1 font-serif text-xl text-foreground">Follow & chat with us</h2>
          <p className="mt-1 text-sm text-muted-foreground">Reach us on WhatsApp or follow along on Instagram.</p>
        </div>
        <SocialLinks whatsapp={settings.whatsapp} instagram={settings.instagram} phone={settings.supportPhone} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild><Link href="/search">Start shopping</Link></Button>
        <Button asChild variant="outline"><Link href="/collections">Browse collections</Link></Button>
      </div>
    </div>
  );
}
