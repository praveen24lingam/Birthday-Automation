"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { sfx } from "@/lib/audio";

export type DiyaStageProps = {
  lit: boolean;
  onLight: () => void;
  flameRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
};

export function DiyaStage({ lit, onLight, flameRef, disabled }: DiyaStageProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!lit && btnRef.current) {
      btnRef.current.focus({ preventScroll: true });
    }
  }, [lit]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Expanding warm ambient glow when diya is lit */}
      <motion.div
        aria-hidden
        initial={{ scale: 0.1, opacity: 0 }}
        animate={lit ? { scale: [0.2, 1.3, 1], opacity: [0, 0.95, 0.85] } : { scale: 0.1, opacity: 0 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute -top-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,176,32,0.45)_0%,rgba(255,100,20,0.22)_40%,rgba(232,87,42,0.08)_65%,transparent_80%)] blur-2xl"
      />

      {/* The Clay Diya */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Flame element */}
        <div ref={flameRef} className="relative -mb-3 h-16 w-12 flex items-end justify-center">
          {lit && (
            <motion.div
              initial={{ scale: 0, y: 15, opacity: 0 }}
              animate={{
                scale: [0.2, 1.25, 1],
                y: [10, -2, 0],
                opacity: 1,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              {/* Outer halo */}
              <div className="absolute h-14 w-10 animate-pulse rounded-full bg-amber-400/50 blur-md" />
              {/* Main flame */}
              <div
                className="relative h-12 w-8 animate-[flame_1.2s_ease-in-out_infinite] rounded-[50%_50%_35%_35%/60%_60%_40%_40%] shadow-[0_0_24px_#ff9a00]"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 75%, #ffffff 0%, #fff2a3 22%, #ffb300 55%, #e65100 85%)",
                }}
              />
              {/* Inner white-hot wick flame */}
              <div
                className="absolute bottom-1 h-5 w-2.5 rounded-full bg-white blur-[0.5px]"
              />
            </motion.div>
          )}
        </div>

        {/* Earthen Clay Diya SVG */}
        <svg
          viewBox="0 0 200 95"
          className="h-20 w-44 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="terracotta" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d26436" />
              <stop offset="50%" stopColor="#b4461b" />
              <stop offset="100%" stopColor="#6e2308" />
            </linearGradient>
            <linearGradient id="brassLip" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd875" />
              <stop offset="50%" stopColor="#f5b942" />
              <stop offset="100%" stopColor="#b37410" />
            </linearGradient>
            <radialGradient id="oilPool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451e08" />
              <stop offset="80%" stopColor="#2b1103" />
            </radialGradient>
          </defs>
          {/* Diya Base Stand */}
          <ellipse cx="100" cy="85" rx="36" ry="7" fill="#4d1704" opacity="0.8" />
          <path d="M72 82 Q100 89 128 82 L120 74 Q100 78 80 74 Z" fill="url(#terracotta)" />
          {/* Diya Bowl */}
          <path
            d="M20 38 Q100 102 180 38 Q194 30 185 24 Q100 4 15 24 Q6 30 20 38 Z"
            fill="url(#terracotta)"
          />
          {/* Oil Reservoir Inside */}
          <ellipse cx="100" cy="27" rx="72" ry="17" fill="url(#oilPool)" />
          {/* Brass Decorative Rim */}
          <path
            d="M22 28 Q100 48 178 28 Q182 25 178 22 Q100 6 22 22 Q18 25 22 28 Z"
            fill="none"
            stroke="url(#brassLip)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Cotton Wick */}
          <path
            d="M98 34 Q100 20 102 12"
            stroke="#261811"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* "Light the diya" button */}
      {!lit && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <button
            ref={btnRef}
            type="button"
            disabled={disabled}
            onClick={() => {
              sfx("chime");
              onLight();
            }}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full border-2 border-amber-400/80 bg-gradient-to-r from-[#2a174a]/90 via-[#401a61]/90 to-[#2a174a]/90 px-7 py-3.5 text-lg font-bold text-amber-200 shadow-[0_0_30px_rgba(255,180,40,0.35)] backdrop-blur-md transition-all hover:scale-105 hover:border-amber-300 hover:shadow-[0_0_40px_rgba(255,180,40,0.6)] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60"
          >
            {/* Pulsing spark dot */}
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-300" />
            </span>
            <span>Light the diya</span>
          </button>
          <span className="text-xs text-amber-200/70">Press Enter or Space</span>
        </motion.div>
      )}
    </div>
  );
}

