"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Store, Menu, X, ChevronLeft,
  Users, Star, Tag, Image as ImageIcon, Mail, Settings, Layers, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/shops", label: "Shops", icon: Store },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active ? "bg-primary/10 font-medium text-primary" : "text-foreground/75 hover:bg-foreground/[0.04] hover:text-foreground",
              collapsed && "lg:justify-center lg:px-0"
            )}
            title={collapsed ? n.label : undefined}
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>{n.label}</span>
          </Link>
        );
      })}
      <Link
        href="/"
        className={cn(
          "mt-auto inline-flex items-center gap-3 rounded-lg border-t border-border px-3 py-2.5 pt-4 text-sm text-foreground/75 transition-colors hover:text-foreground",
          collapsed && "lg:justify-center lg:px-0"
        )}
        title="Back to store"
      >
        <Store className="size-4 shrink-0" />
        <span className={cn(collapsed && "lg:hidden")}>Back to store</span>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
        <button onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-md hover:bg-foreground/5 lg:hidden">
          <Menu className="size-5" />
        </button>
        <button onClick={() => setCollapsed((c) => !c)} className="hidden size-9 place-items-center rounded-md hover:bg-foreground/5 lg:grid">
          <ChevronLeft className={cn("size-5 transition-transform", collapsed && "rotate-180")} />
        </button>
        <Logo className="text-base" />
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-foreground/60">Admin</span>
      </header>

      <div className="flex">
        {/* desktop sidebar */}
        <aside className={cn("sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-border transition-all lg:block", collapsed ? "w-16" : "w-60")}>
          {Sidebar}
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-background shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <Logo className="text-base" />
                <button onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-md hover:bg-foreground/5">
                  <X className="size-5" />
                </button>
              </div>
              {Sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
