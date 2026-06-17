import { AccountNav } from "@/components/shared/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
      <h1 className="font-serif text-2xl text-foreground md:text-3xl">My account</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-max lg:sticky lg:top-24">
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
