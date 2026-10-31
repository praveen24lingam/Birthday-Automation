"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Person, Wish } from "@/lib/data/types";
import { firstName } from "@/lib/utils";

export type SkyLanternsProps = {
  person: Person;
  wishes: Wish[];
  onReadAgain: () => void;
  onReplay: () => void;
  active: boolean;
};

type Lantern = {
  x: number;
  y: number;
  vy: number;
  sw: number;
  amp: number;
  ph: number;
  scale: number;
  opacity: number;
  hue: number;
};

export function SkyLanterns({ person, wishes, onReadAgain, onReplay, active }: SkyLanternsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const reduce = useReducedMotion();

  // Pick a memorable wish quote for the sky
  const celebrantWish = wishes.find((w) => w.to === person.id && w.text.length > 20) || wishes[0];
  const quoteText =
    celebrantWish?.text.slice(0, 110) ||
    "May your year be filled with wonder, joy, and endless reasons to smile.";

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    // Create lantern sprite
    const sprite = document.createElement("canvas");
    const S = 80;
    sprite.width = S * 2;
    sprite.height = S * 2;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      // Glow halo
      const grad = sctx.createRadialGradient(S, S, 0, S, S, S);
      grad.addColorStop(0, "rgba(255,200,80,0.65)");
      grad.addColorStop(0.35, "rgba(255,140,40,0.22)");
      grad.addColorStop(1, "rgba(255,100,20,0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, S * 2, S * 2);

      // Lantern paper body
      sctx.save();
      sctx.translate(S, S);
      sctx.beginPath();
      sctx.moveTo(-20, -30);
      sctx.lineTo(20, -30);
      sctx.quadraticCurveTo(28, 0, 18, 30);
      sctx.lineTo(-18, 30);
      sctx.quadraticCurveTo(-28, 0, -20, -30);
      sctx.closePath();

      const bodyGrad = sctx.createLinearGradient(0, -30, 0, 30);
      bodyGrad.addColorStop(0, "#ffb84d");
      bodyGrad.addColorStop(0.6, "#ffa31a");
      bodyGrad.addColorStop(1, "#ff7b00");
      sctx.fillStyle = bodyGrad;
      sctx.fill();

      // Flame core at bottom opening
      sctx.beginPath();
      sctx.ellipse(0, 26, 4, 3, 0, 0, Math.PI * 2);
      sctx.fillStyle = "#fff8e7";
      sctx.shadowColor = "#ffea85";
      sctx.shadowBlur = 8;
      sctx.fill();
      sctx.restore();
    }

    const count = W < 640 ? 14 : 28;
    const lanterns: Lantern[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * W,
      y: (H * 0.2) + (Math.random() * H * 0.9),
      vy: 18 + Math.random() * 26,
      sw: 0.8 + Math.random() * 1.4,
      amp: 15 + Math.random() * 25,
      ph: Math.random() * Math.PI * 2,
      scale: 0.45 + Math.random() * 0.55,
      opacity: 0.5 + Math.random() * 0.5,
      hue: i,
    }));

    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, W, H);

      lanterns.forEach((L) => {
        L.y -= L.vy * dt;
        L.ph += dt * L.sw;

        if (L.y < -100) {
          L.y = H + 60;
          L.x = Math.random() * W;
        }

        const swayX = L.x + Math.sin(L.ph) * L.amp;
        const size = S * 2 * L.scale;

        ctx.globalAlpha = L.opacity * (0.85 + 0.15 * Math.sin(L.ph * 2));
        ctx.drawImage(sprite, swayX - size / 2, L.y - size / 2, size, size);
      });

      animRef.current = requestAnimationFrame(loop);
    };

    if (!reduce) {
      animRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, reduce]);

  if (!active) return null;

  return (
    <div className="relative z-20 flex min-h-[85vh] w-full flex-col items-center justify-between px-4 py-8 text-center">
      {/* Floating Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Hero Sky Tribute */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 35, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="relative z-30 mx-auto mt-12 max-w-xl rounded-3xl border border-amber-300/30 bg-[#1e1338]/80 p-8 shadow-[0_0_50px_rgba(255,180,40,0.25)] backdrop-blur-md"
      >
        <span className="font-mono text-xs uppercase tracking-widest text-amber-300/80">
          Birthday Wish in the Sky
        </span>
        <h2 className="mt-2 font-display text-4xl text-amber-100 sm:text-5xl">
          Happy Birthday, {firstName(person.name)}!
        </h2>
        <div className="my-5 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <blockquote className="font-serif text-xl italic leading-relaxed text-amber-200/95 sm:text-2xl">
          “{quoteText}”
        </blockquote>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-300/70">
          With warmth from NavGurukul
        </p>
      </motion.div>

      {/* Finale Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-30 mb-8 flex flex-wrap justify-center gap-3"
      >
        <button
          type="button"
          onClick={onReadAgain}
          className="rounded-full border border-amber-400/60 bg-amber-400/10 px-6 py-3 font-semibold text-amber-200 backdrop-blur transition hover:bg-amber-400/20 hover:text-white active:scale-95"
        >
          Read the letter again
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="rounded-full border border-amber-400/60 bg-amber-400/10 px-6 py-3 font-semibold text-amber-200 backdrop-blur transition hover:bg-amber-400/20 hover:text-white active:scale-95"
        >
          Watch again ↺
        </button>
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3 font-bold text-neutral-900 shadow-lg shadow-amber-500/20 transition hover:scale-105 active:scale-95 no-underline"
        >
          Back to Birthday Board
        </Link>
      </motion.div>
    </div>
  );
}

