import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const title = "NairobiComradeStore — Real deals for the Nairobi comrade";
const description =
  "Fashion, shoes, electronics, home, beauty and sports — delivered across Nairobi. Pay with M-Pesa or Cash on Delivery. Prices in Ksh.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s · NairobiComradeStore" },
  description,
  applicationName: "NairobiComradeStore",
  keywords: [
    "Nairobi online shopping", "Kenya ecommerce", "buy online Kenya", "M-Pesa shopping",
    "cash on delivery Nairobi", "comrade store", "student deals Kenya", "NairobiComradeStore",
  ],
  authors: [{ name: "NairobiComradeStore" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "NairobiComradeStore",
    title,
    description,
    locale: "en_KE",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
