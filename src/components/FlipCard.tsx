"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { Person } from "@/lib/data/types";
import { Avatar } from "./ui/Avatar";
import { colorFor, fmtBday, hash } from "@/lib/utils";
import { sfx } from "@/lib/audio";

const PINS = [
  { head: "#ef4444", rim: "#991b1b" }, // Crimson
  { head: "#f59e0b", rim: "#b45309" }, // Amber
  { head: "#06b6d4", rim: "#0e7490" }, // Cyan
  { head: "#8b5cf6", rim: "#6d28d9" }, // Purple
  { head: "#ec4899", rim: "#be185d" }, // Rose
  { head: "#10b981", rim: "#047857" }, // Emerald
];

export function FlipCard({ p, wishCount, today, index }: { p: Person & { sample?: boolean }; wishCount: number; today: boolean; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const tilt = ((hash(p.id) % 5) - 2) * 0.7;
  const pin = PINS[Math.abs(hash(p.id)) % PINS.length];

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  return (
    <motion.li className="relative list-none select-none pt-2.5 pb-2" style={{ rotate: tilt }}
      initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20px" }}
      whileHover={reduce ? {} : { scale: 1.04, y: -8, zIndex: 30 }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay: (index % 8) * 0.04 }}>
      
      {/* 3D Realistic Pushpin */}
      <div className="pointer-events-none absolute -top-1 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center">
        <div
          className="h-4 w-4 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.4)] ring-2 ring-white/80"
          style={{
            background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${pin.head} 55%, ${pin.rim} 100%)`,
          }}
        />
        <div className="h-1.5 w-1 rounded-b-xs bg-neutral-400 shadow-xs -mt-0.5" />
      </div>

      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        onClick={() => { setFlipped((f) => !f); sfx("flip"); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); sfx("flip"); } }}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="flip block aspect-[3/4] w-full cursor-pointer rounded-[20px] bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--a1)] group"
        style={{ rotateX: rx, rotateY: ry }}
      >
        <motion.span className="flip-inner block" animate={{ rotateY: flipped ? 180 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 16 }}>
          
          {/* FRONT FACE: Authentic Polaroid Card */}
          <span className={`flip-face border-2 bg-[#fdfbf7] dark:bg-[#1f1830] p-3 pb-2.5 transition-all duration-300 group-hover:shadow-[0_18px_36px_rgba(0,0,0,0.35)] ${today ? "border-amber-400 shadow-[0_0_24px_rgba(255,190,40,0.45)] ring-2 ring-amber-400/30" : "border-[#e0d6c5] dark:border-[#382b52]"}`} aria-hidden={flipped}>
            
            {/* Polaroid photo container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 shadow-inner">
              <Avatar person={p} className="h-full w-full rounded-xl text-[clamp(2.5rem,10vw,3.6rem)] transition-transform duration-500 group-hover:scale-105" />
              {today && (
                <span className="absolute bottom-2 left-2 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-neutral-950 shadow-md">
                  🎉 Today!
                </span>
              )}
            </div>

            {/* Polaroid label & metadata */}
            <div className="pt-2.5 pb-0.5 flex flex-col justify-between flex-1">
              <div>
                <span className="hand block truncate font-display text-xl leading-tight transition-colors group-hover:text-amber-500 text-ink">
                  {p.name}
                </span>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-xs text-muted">
                  <span className="font-semibold text-accent flex items-center gap-1">
                    <span>🎂</span>
                    <span>{fmtBday(p.bday, true)}</span>
                  </span>
                  {p.group && (
                    <span className="truncate rounded-md bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium max-w-[100px]">
                      {p.group}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-black/5 dark:border-white/10 pt-2">
                <span className="text-[11px] text-muted font-medium">
                  {wishCount > 0 ? `💌 ${wishCount}` : "Tap 🔄"}
                </span>
                <Link
                  href={`/celebrate/?id=${encodeURIComponent(p.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-bold text-neutral-950 shadow-sm transition-all hover:scale-105 active:scale-95 no-underline flex items-center gap-1"
                >
                  <span>Celebrate</span>
                  <span className="text-neutral-900">✨</span>
                </Link>
              </div>
            </div>
          </span>

          {/* BACK FACE: Personal Note */}
          <span className="flip-face flip-back flex flex-col justify-between gap-1.5 p-4 text-[#2b1747] shadow-2xl rounded-[20px]" style={{ background: colorFor(p.id) }} aria-hidden={!flipped}>
            <div>
              <span className="hand font-display text-[1.35rem] leading-tight block">{p.name}</span>
              <span className="text-xs font-semibold opacity-80 block">Birthday: {fmtBday(p.bday, true)}{p.group ? ` · ${p.group}` : ""}</span>
            </div>
            <span className={`hand flex-1 overflow-y-auto whitespace-pre-wrap font-hand text-[.95rem] leading-snug my-1 ${p.note ? "" : "italic opacity-75"}`}>{p.note || "A personal birthday note is on its way."}</span>
            <div className="flex items-center justify-between gap-2 border-t border-black/10 pt-2 text-xs font-semibold">
              <span className="opacity-75">{p.sample ? "" : `${wishCount} ${wishCount === 1 ? "wish" : "wishes"}`}</span>
              <Link
                href={`/celebrate/?id=${encodeURIComponent(p.id)}`}
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-white/95 px-3.5 py-1.5 font-bold text-[#2b1747] shadow-md transition-all hover:scale-110 hover:bg-white active:scale-95 no-underline flex items-center gap-1.5"
              >
                <span>Celebrate</span>
                <span className="text-amber-500 animate-pulse">✨</span>
              </Link>
            </div>
          </span>
        </motion.span>
      </motion.div>
      {today && <span className="absolute -top-1.5 right-2 z-30 rounded-full bg-[var(--a2)] px-2.5 py-0.5 text-xs font-bold text-white shadow-lg animate-bounce">Today 🎉</span>}
    </motion.li>
  );
}
