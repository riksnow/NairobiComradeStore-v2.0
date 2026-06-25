"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/** Floating "back to top" button — appears once the user scrolls down. */
export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => { setShow(window.scrollY > 400); ticking = false; };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="scroll-to-top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ y: -2 }}
          className="fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-foreground/10 transition-colors hover:bg-primary/90 md:bottom-7 md:right-7 md:size-12"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
