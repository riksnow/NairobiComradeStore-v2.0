import Link from "next/link";
import { store } from "@/lib/catalog";
import { getSettings, getCategories } from "@/lib/data";
import { Logo } from "@/components/shared/logo";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { SocialLinks } from "@/components/shared/social-links";

export async function Footer() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <footer className="mt-20 border-t border-border bg-background">
      <div className="mx-auto max-w-[1500px] px-4 py-14 md:px-8">
        {/* subscribe */}
        <div className="flex flex-col gap-6 border-b border-border pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-serif text-2xl text-foreground">Join the comrades</h3>
            <p className="mt-2 text-sm text-muted-foreground">Deals, drops and restocks — straight to your inbox.</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="text-lg" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{store.tagline}</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">By comrades, for comrades — built for students across Kenyan universities, colleges and learning institutions.</p>
            <p className="mt-4 text-xs text-muted-foreground">{settings.address}</p>
            <p className="text-xs text-muted-foreground">{settings.supportPhone}</p>
            <p className="text-xs text-muted-foreground">{settings.supportEmail}</p>

            <SocialLinks whatsapp={settings.whatsapp} instagram={settings.instagram} phone={settings.supportPhone} className="mt-5" />
          </div>

          <FooterCol title="Shop">
            {categories.map((c) => (
              <FooterLink key={c.slug} href={`/category/${c.slug}`}>{c.name}</FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Help">
            <FooterLink href="/size-guide">Size guide</FooterLink>
            <FooterLink href="/legal/shipping-returns">Shipping &amp; returns</FooterLink>
            <FooterLink href="/account/orders">Track an order</FooterLink>
            <FooterLink href="/flash-sales">Flash sales</FooterLink>
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/collections">Collections</FooterLink>
            <FooterLink href="/legal/privacy-policy">Privacy policy</FooterLink>
            <FooterLink href="/legal/terms-of-service">Terms of service</FooterLink>
            <FooterLink href="/legal/cookie-policy">Cookie policy</FooterLink>
          </FooterCol>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <p>Pay with M-Pesa or Cash on Delivery · Prices in Ksh</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="eyebrow text-[0.6rem] text-muted-foreground">{title}</h4>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-foreground/80 transition-colors hover:text-primary">{children}</Link>
    </li>
  );
}
