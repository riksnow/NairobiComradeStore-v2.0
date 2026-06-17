"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Package,
  MapPin,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground/75 hover:bg-foreground/[0.04] hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {l.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm text-foreground/75 transition-colors hover:bg-foreground/[0.04] hover:text-destructive lg:mt-2 lg:border-t lg:border-border lg:pt-4"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </nav>
  );
}
