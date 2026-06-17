import { Suspense } from "react";
import { SuccessClient } from "./success-client";

export const metadata = { title: "Order confirmed — NairobiComradeStore" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8">
      <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>}>
        <SuccessClient />
      </Suspense>
    </div>
  );
}
