"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Heart, ShoppingBag, User, Menu, X, Zap,
  Search as SearchIcon, ChevronDown, LogOut, LayoutDashboard,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCategories } from "@/lib/hooks/use-categories";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store-context";
import { Logo } from "@/components/shared/logo";
import { SearchBar } from "@/components/shared/search-bar";
import { AnnouncementMarquee } from "@/components/shared/announcement-marquee";
import { useClickAway } from "@/lib/hooks/use-click-away";

export function Header() {
  const { cartCount, wishlistCount, setCartOpen, setWishlistOpen } = useStore();
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0];
  const categories = useCategories();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collOpen, setCollOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const collRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  useClickAway(collRef, () => setCollOpen(false), collOpen);
  useClickAway(acctRef, () => setAcctOpen(false), acctOpen);
  useClickAway(searchRef, () => setSearchOpen(false), searchOpen);

  // Unread-notification indicator (orange dot).
  const checkUnread = useCallback(async () => {
    if (!user) { setHasUnread(false); return; }
    try {
      const r = await fetch("/api/user/notifications");
      if (!r.ok) return;
      const list = await r.json();
      setHasUnread(Array.isArray(list) && list.some((n: { isRead?: boolean }) => !n.isRead));
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    checkUnread();
    if (!user) return;
    const t = setInterval(checkUnread, 60000);
    return () => clearInterval(t);
  }, [user, checkUnread]);

  // Re-check when the account menu opens (reflects reads made on the notifications page).
  useEffect(() => { if (acctOpen) checkUnread(); }, [acctOpen, checkUnread]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <AnnouncementMarquee />

        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 md:px-8">
          <div className="relative flex h-16 items-center gap-1">
            {/* LEFT — menu (mobile) + inline logo (mobile), Collections + About (desktop) */}
            <div className="flex min-w-0 items-center gap-1">
              <button className="grid size-10 shrink-0 place-items-center lg:hidden" aria-label="Menu" onClick={() => setMenuOpen(true)}>
                <Menu className="size-6 text-foreground" />
              </button>

              {!searchOpen && (
                <Logo className="truncate text-[0.95rem] sm:text-lg lg:hidden" />
              )}

              <div className="relative hidden lg:block" ref={collRef}>
                <button
                  onClick={() => setCollOpen((o) => !o)}
                  aria-expanded={collOpen}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm text-foreground/80 hover:text-foreground"
                >
                  Collections <ChevronDown className={cn("size-4 transition-transform", collOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {collOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-[0_20px_50px_rgba(61,57,41,0.14)]"
                    >
                      <MenuLink href="/search" onClick={() => setCollOpen(false)}>All products</MenuLink>
                      {categories.map((c) => (
                        <MenuLink key={c.slug} href={`/category/${c.slug}`} onClick={() => setCollOpen(false)}>{c.name}</MenuLink>
                      ))}
                      <div className="my-1 border-t border-border" />
                      <Link href="/flash-sales" onClick={() => setCollOpen(false)} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent">
                        <Zap className="size-4" /> Flash sales
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/about" className="hidden rounded-md px-2 py-2 text-sm text-foreground/80 hover:text-foreground lg:inline-flex">
                About
              </Link>
            </div>

            {/* CENTER — logo (desktop only) */}
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 lg:block">
              <Logo className="pointer-events-auto text-xl" />
            </div>

            {/* RIGHT — search (expanding), account, wishlist, cart */}
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
              <div className="flex items-center" ref={searchRef}>
                <AnimatePresence initial={false}>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "min(560px, 78vw)", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 280, damping: 30 }}
                      className="relative z-50 overflow-visible"
                    >
                      <div className="pr-1"><SearchBar autoFocus onNavigate={() => setSearchOpen(false)} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search" className="relative z-50 grid size-10 place-items-center text-foreground">
                  {searchOpen ? <X className="size-5" /> : <SearchIcon className="size-5" />}
                </button>
              </div>

              <div className="relative" ref={acctRef}>
                <button
                  onClick={() => setAcctOpen((o) => !o)}
                  aria-expanded={acctOpen}
                  className="flex items-center gap-1.5 rounded-full px-1.5 py-1.5 text-foreground hover:bg-foreground/[0.04]"
                  aria-label="Account"
                >
                  <span className="relative">
                    <User className="size-5" />
                    {hasUnread && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary ring-2 ring-background" aria-hidden />}
                  </span>
                  <span className="hidden max-w-[7rem] truncate text-sm md:inline">{firstName ?? "Sign in"}</span>
                </button>
                <AnimatePresence>
                  {acctOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-[0_20px_50px_rgba(61,57,41,0.14)]"
                    >
                      {user ? (
                        <>
                          <div className="px-3 py-2">
                            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="my-1 border-t border-border" />
                          <MenuLink href="/account" onClick={() => setAcctOpen(false)}>My account</MenuLink>
                          <MenuLink href="/account/orders" onClick={() => setAcctOpen(false)}>Orders</MenuLink>
                          <Link
                            href="/account/notifications"
                            onClick={() => setAcctOpen(false)}
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
                          >
                            <span className="inline-flex items-center gap-2">
                              Notifications
                              {hasUnread && <span className="size-2 rounded-full bg-primary" aria-hidden />}
                            </span>
                            {hasUnread && <span className="text-[0.65rem] font-medium text-primary">New</span>}
                          </Link>
                          <MenuLink href="/account/settings" onClick={() => setAcctOpen(false)}>Settings</MenuLink>
                          {user.role === "Admin" && (
                            <Link href="/admin" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent">
                              <LayoutDashboard className="size-4" /> Admin panel
                            </Link>
                          )}
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => { setAcctOpen(false); signOut({ callbackUrl: "/" }); }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
                          >
                            <LogOut className="size-4" /> Sign out
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-3 py-2 text-sm text-muted-foreground">You&apos;re not signed in</div>
                          <div className="my-1 border-t border-border" />
                          <MenuLink href="/sign-in" onClick={() => setAcctOpen(false)}>Sign in</MenuLink>
                          <MenuLink href="/sign-up" onClick={() => setAcctOpen(false)}>Create account</MenuLink>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setWishlistOpen(true)} className="relative grid size-10 place-items-center text-foreground" aria-label="Wishlist">
                <Heart className="size-5" />
                {wishlistCount > 0 && <Badge n={wishlistCount} />}
              </button>
              <button onClick={() => setCartOpen(true)} className="relative grid size-10 place-items-center text-foreground" aria-label="Cart">
                <ShoppingBag className="size-5" />
                {cartCount > 0 && <Badge n={cartCount} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page blur backdrop while searching — outside <header> so `fixed` covers the viewport */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[3px]"
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER — outside <header> so it overlays the whole page (z above header) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <Logo className="text-lg" onClick={() => setMenuOpen(false)} />
                <button onClick={() => setMenuOpen(false)} aria-label="Close"><X className="size-6 text-foreground" /></button>
              </div>

              {user && (
                <div className="mt-5 rounded-lg border border-border bg-card p-3">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}

              <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">Collections</p>
              <nav className="mt-2 flex flex-col">
                <Link href="/search" onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-foreground">All products</Link>
                {categories.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-foreground">{c.name}</Link>
                ))}
                <Link href="/flash-sales" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 border-b border-border py-3 font-medium text-primary">
                  <Zap className="size-4" /> Flash sales
                </Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-foreground">About</Link>
              </nav>

              <div className="mt-6 flex flex-col gap-3 text-sm text-foreground/80">
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setMenuOpen(false)}>My account</Link>
                    <Link href="/account/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
                    <Link href="/account/notifications" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2">
                      Notifications {hasUnread && <span className="size-2 rounded-full bg-primary" aria-hidden />}
                    </Link>
                    {user.role === "Admin" && <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-medium text-primary">Admin panel</Link>}
                    <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="inline-flex items-center gap-2 text-left text-destructive">
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" onClick={() => setMenuOpen(false)}>Sign in</Link>
                    <Link href="/sign-up" onClick={() => setMenuOpen(false)}>Create account</Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground">
      {children}
    </Link>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.55rem] font-medium leading-4 text-primary-foreground">
      {n}
    </span>
  );
}
