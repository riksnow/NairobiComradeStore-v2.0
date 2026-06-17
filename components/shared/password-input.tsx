"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState("CapsLock"))}
        className={cn(
          "h-12 w-full rounded-md border border-border bg-card px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      {focused && caps && (
        <p className="mt-1.5 text-xs text-primary">Caps Lock is on</p>
      )}
    </div>
  );
}
