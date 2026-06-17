"use client";

import { useEffect, useRef } from "react";

type Drop = { x: number; y: number; len: number; speed: number; o: number };
type Splash = { x: number; y: number; vx: number; vy: number; life: number; max: number };

// Claude terracotta (#c96442)
const RGB = "201, 100, 66";

/**
 * Falling-rain canvas behind the auth card. Drops splash when they hit the top
 * edge of the form (any element marked [data-rain-surface]) and again when they
 * reach the bottom of the page, so the rain reads as landing on the card and
 * pooling on the ground.
 */
export function RainBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let drops: Drop[] = [];
    let splashes: Splash[] = [];
    let surface: HTMLElement | null = null;

    const mk = (): Drop => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: 10 + Math.random() * 18,
      speed: 3 + Math.random() * 5,
      o: 0.14 + Math.random() * 0.24,
    });

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.min(170, Math.floor(canvas.width / 7));
      drops = Array.from({ length: count }, mk);
    };

    const spawnSplash = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
        const sp = 1 + Math.random() * 2.4;
        splashes.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 12 + Math.random() * 10 });
      }
    };

    resize();
    window.addEventListener("resize", resize);
    surface = document.querySelector<HTMLElement>("[data-rain-surface]");

    const drawDrops = () => {
      for (const d of drops) {
        ctx.strokeStyle = `rgba(${RGB}, ${d.o})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Form surface (top edge) in canvas coordinates.
      let sTop = Infinity, sLeft = 0, sRight = 0;
      if (surface) {
        const cr = canvas.getBoundingClientRect();
        const r = surface.getBoundingClientRect();
        sTop = r.top - cr.top;
        sLeft = r.left - cr.left;
        sRight = sLeft + r.width;
      }
      const ground = canvas.height - 2;

      for (const d of drops) {
        ctx.strokeStyle = `rgba(${RGB}, ${d.o})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;

        const tip = d.y + d.len;
        if (tip >= sTop && d.y < sTop && d.x >= sLeft && d.x <= sRight) {
          spawnSplash(d.x, sTop, 3); // splash on the form's top edge
          Object.assign(d, mk(), { y: -d.len, x: Math.random() * canvas.width });
          continue;
        }
        if (d.y > ground) {
          spawnSplash(d.x, ground, 4); // splash on the ground
          Object.assign(d, mk(), { y: -d.len, x: Math.random() * canvas.width });
        }
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12; // gravity
        const t = 1 - s.life / s.max;
        if (t <= 0) { splashes.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${RGB}, ${0.4 * t})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    if (reduce) drawDrops();
    else frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}
