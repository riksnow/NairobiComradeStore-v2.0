import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { store } from "@/lib/catalog";

type Doc = { title: string; updated: string; body: { h: string; p: string }[] };

const DOCS: Record<string, Doc> = {
  "privacy-policy": {
    title: "Privacy Policy",
    updated: "June 2026",
    body: [
      { h: "What we collect", p: "We collect the details you give us when you create an account or place an order — your name, phone number, delivery address and order history — so we can fulfil and deliver your orders." },
      { h: "How we use it", p: "Your information is used to process orders, arrange delivery within Nairobi, send order updates, and improve the store. We do not sell your personal data." },
      { h: "Payments", p: "M-Pesa payments are processed by Safaricom. We never store your M-Pesa PIN. Cash on Delivery is settled directly with the rider." },
      { h: "Your choices", p: `You can update your profile and addresses any time in your account, or unsubscribe from marketing emails. For data requests, contact ${store.supportEmail}.` },
    ],
  },
  "terms-of-service": {
    title: "Terms of Service",
    updated: "June 2026",
    body: [
      { h: "Using the store", p: "By placing an order you confirm the details you provide are accurate and that you are able to receive delivery at the address given." },
      { h: "Pricing", p: "All prices are in Kenya Shillings (Ksh) and include applicable taxes. Prices and offers can change, but the price confirmed at checkout is what applies to your order." },
      { h: "Orders", p: "We may decline or cancel an order if an item is out of stock or a pricing error occurs. Where payment was taken, it will be refunded." },
      { h: "Delivery", p: "Delivery is within Nairobi and surrounding areas. Estimated times are guidance, not guarantees." },
    ],
  },
  "shipping-returns": {
    title: "Shipping & Returns",
    updated: "June 2026",
    body: [
      { h: "Delivery fees", p: "Delivery within Nairobi is a flat Ksh 250, and free on orders of Ksh 3,500 or more." },
      { h: "Timelines", p: "Most CBD and nearby-estate orders arrive same-day or next-day. You’ll get updates as your order moves from Processing to Shipped to Delivered." },
      { h: "Returns", p: "Unused items in original condition can be returned within 7 days of delivery. Some items (innerwear, opened beauty products) can’t be returned for hygiene reasons." },
      { h: "Refunds", p: "Approved refunds are sent back to your M-Pesa number, or deducted from a Cash on Delivery balance where relevant." },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    updated: "June 2026",
    body: [
      { h: "What cookies do", p: "We use a small amount of local storage to keep your cart and wishlist on this device and to keep you signed in." },
      { h: "Analytics", p: "We may use privacy-respecting analytics to understand which products and pages are useful, in aggregate." },
      { h: "Managing cookies", p: "You can clear local storage from your browser settings at any time; doing so will empty your cart and wishlist on this device." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const d = DOCS[doc];
  return { title: d ? `${d.title} — NairobiComradeStore` : "NairobiComradeStore" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const d = DOCS[doc];
  if (!d) notFound();

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 md:px-8">
      <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Home
      </Link>
      <h1 className="font-serif text-3xl text-foreground">{d.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">Last updated {d.updated}</p>

      <div className="mt-8 space-y-7">
        {d.body.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-lg text-foreground">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
