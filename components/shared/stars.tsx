import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating);
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(filled ? "fill-primary text-primary" : "fill-transparent text-border")}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}
