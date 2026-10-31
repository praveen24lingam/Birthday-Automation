"use client";
import { useReducedMotion } from "motion/react";

const BULBS = [
  { color: "#ffb020", glow: "rgba(255,176,32,0.8)" },
  { color: "#ff5d86", glow: "rgba(255,93,134,0.8)" },
  { color: "#38bdf8", glow: "rgba(56,189,248,0.8)" },
  { color: "#a78bfa", glow: "rgba(167,139,250,0.8)" },
  { color: "#4ade80", glow: "rgba(74,222,128,0.8)" },
  { color: "#fb7185", glow: "rgba(251,113,133,0.8)" },
  { color: "#facc15", glow: "rgba(250,204,21,0.8)" },
  { color: "#c084fc", glow: "rgba(192,132,252,0.8)" },
];

export function FairyLights({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative -mb-3 w-full select-none overflow-hidden px-4 pt-1 pointer-events-none" aria-hidden="true">
      {/* Wire curve */}
      <svg className="h-6 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
        <path
          d="M 0,4 Q 25,18 50,8 Q 75,18 100,4"
          fill="none"
          stroke="rgba(120, 100, 80, 0.45)"
          strokeWidth="1"
        />
      </svg>
      {/* Hanging Bulbs */}
      <div className="absolute inset-x-6 top-2 flex justify-between">
        {Array.from({ length: count }, (_, i) => {
          const bulb = BULBS[i % BULBS.length];
          // Arc offset to align with wire
          const x = i / (count - 1);
          const arc = Math.sin(x * Math.PI * 2) * 4;
          return (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ transform: `translateY(${arc}px)` }}
            >
              {/* Socket cap */}
              <div className="h-1.5 w-2 rounded-t-sm bg-neutral-700/80" />
              {/* Glowing Bulb */}
              <div
                className={`h-3 w-2.5 rounded-full shadow-sm ${reduce ? "" : "animate-pulse"}`}
                style={{
                  backgroundColor: bulb.color,
                  boxShadow: `0 0 8px ${bulb.glow}`,
                  animationDuration: `${1.8 + (i % 3) * 0.4}s`,
                  animationDelay: `${(i * 0.2) % 1.5}s`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

