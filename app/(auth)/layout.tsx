import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { RainBackground } from "@/components/shared/rain-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-secondary/40">
      <RainBackground />
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to store
        </Link>
        <Logo className="text-lg" />
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-4 py-4">
        <div data-rain-surface className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
