import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { CartSheet } from "@/components/shared/cart-sheet";
import { WishlistSheet } from "@/components/shared/wishlist-sheet";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartSheet />
      <WishlistSheet />
    </>
  );
}
