"use client";
import { motion, useReducedMotion } from "motion/react";
import type { TemplateKey } from "@/lib/data/types";
import { TEMPLATES } from "@/lib/templates";

export type TemplateGarlandProps = {
  tpl: TemplateKey;
  active: boolean;
};

export function TemplateGarland({ tpl, active }: TemplateGarlandProps) {
  const reduce = useReducedMotion();
  const cols = TEMPLATES[tpl]?.cols || ["#ffb020", "#ff5d86", "#18a19c", "#9b7bff"];

  if (!active) return null;

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { y: -160, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 14,
        mass: 1.2,
      }}
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex w-full justify-center overflow-hidden"
      aria-hidden
    >
      <div className="relative h-28 w-full max-w-5xl px-4 sm:h-36">
        {/* Mehfil: Traditional Marigold Toran with lush orange & yellow flowers */}
        {tpl === "mehfil" && (
          <svg viewBox="0 0 1000 120" className="h-full w-full overflow-visible" preserveAspectRatio="none">
            {/* Hanging Cord */}
            <path
              d="M 0 10 Q 250 85 500 20 Q 750 85 1000 10"
              fill="none"
              stroke="#8a4b08"
              strokeWidth="2.5"
            />
            {/* Swag 1 Beads */}
            {Array.from({ length: 25 }, (_, i) => {
              const t = i / 24;
              const x = t * 500;
              const y = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 85 + t * t * 20;
              const isYellow = i % 2 === 0;
              return (
                <g key={`m1-${i}`} transform={`translate(${x}, ${y})`}>
                  <circle
                    r={i % 4 === 0 ? 9 : 7}
                    fill={isYellow ? "#ffc107" : "#ff6f00"}
                    stroke="#e65100"
                    strokeWidth="1.2"
                  />
                  <circle r={2.5} fill="#fff9c4" opacity="0.6" />
                </g>
              );
            })}
            {/* Swag 2 Beads */}
            {Array.from({ length: 25 }, (_, i) => {
              const t = i / 24;
              const x = 500 + t * 500;
              const y = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 85 + t * t * 10;
              const isYellow = i % 2 === 0;
              return (
                <g key={`m2-${i}`} transform={`translate(${x}, ${y})`}>
                  <circle
                    r={i % 4 === 0 ? 9 : 7}
                    fill={isYellow ? "#ffc107" : "#ff6f00"}
                    stroke="#e65100"
                    strokeWidth="1.2"
                  />
                  <circle r={2.5} fill="#fff9c4" opacity="0.6" />
                </g>
              );
            })}
            {/* Hanging Floral Tassels at intervals */}
            {[125, 250, 375, 500, 625, 750, 875].map((tx, idx) => (
              <g key={`tas-${idx}`} transform={`translate(${tx}, 50)`}>
                <line x1="0" y1="0" x2="0" y2="40" stroke="#8a4b08" strokeWidth="1.5" />
                <circle cx="0" cy="12" r="6" fill="#ff6f00" />
                <circle cx="0" cy="24" r="6" fill="#ffc107" />
                <circle cx="0" cy="36" r="7" fill="#e65100" />
                <path d="M-3 42 L3 42 L0 52 Z" fill="#ffd54f" />
              </g>
            ))}
          </svg>
        )}

        {/* Party: Colorful pennants / bunting */}
        {tpl === "party" && (
          <svg viewBox="0 0 1000 120" className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <path
              d="M 0 15 Q 500 90 1000 15"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="2"
            />
            {Array.from({ length: 17 }, (_, i) => {
              const t = (i + 0.5) / 17;
              const x = t * 1000;
              const y = (1 - t) * (1 - t) * 15 + 2 * (1 - t) * t * 90 + t * t * 15;
              const color = cols[i % cols.length];
              return (
                <polygon
                  key={`p-${i}`}
                  points={`${x - 24},${y - 2} ${x + 24},${y - 2} ${x},${y + 44}`}
                  fill={color}
                  opacity="0.9"
                />
              );
            })}
          </svg>
        )}

        {/* Starlight: Hanging celestial stars and moon */}
        {tpl === "starlight" && (
          <svg viewBox="0 0 1000 120" className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <path
              d="M 0 15 Q 500 80 1000 15"
              fill="none"
              stroke="#8fb3ff"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            {Array.from({ length: 15 }, (_, i) => {
              const t = (i + 0.5) / 15;
              const x = t * 1000;
              const y = (1 - t) * (1 - t) * 15 + 2 * (1 - t) * t * 80 + t * t * 15;
              const drop = 14 + ((i * 17) % 28);
              return (
                <g key={`star-${i}`} transform={`translate(${x}, ${y})`}>
                  <line x1="0" y1="0" x2="0" y2={drop} stroke="#8fb3ff" strokeWidth="1" opacity="0.6" />
                  <g transform={`translate(0, ${drop})`}>
                    <polygon
                      points="0,-8 2.5,-2.5 8,-2.5 3.5,1.5 5.5,7 0,3.5 -5.5,7 -3.5,1.5 -8,-2.5 -2.5,-2.5"
                      fill="#f6d36b"
                      className="animate-pulse"
                    />
                  </g>
                </g>
              );
            })}
          </svg>
        )}

        {/* Pinboard: Jute line with flags */}
        {tpl === "pinboard" && (
          <svg viewBox="0 0 1000 120" className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <path
              d="M 0 10 Q 500 75 1000 10"
              fill="none"
              stroke="#5c3a1e"
              strokeWidth="2.5"
            />
            {Array.from({ length: 14 }, (_, i) => {
              const t = (i + 0.5) / 14;
              const x = t * 1000;
              const y = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 75 + t * t * 10;
              const color = cols[i % cols.length];
              return (
                <g key={`pin-${i}`} transform={`translate(${x}, ${y})`}>
                  <polygon
                    points={`-18,0 18,0 0,36`}
                    fill={color}
                    opacity="0.85"
                  />
                  {/* Pin Peg */}
                  <rect x="-3" y="-5" width="6" height="12" rx="1.5" fill="#d4a373" stroke="#8c6239" strokeWidth="0.8" />
                </g>
              );
            })}
          </svg>
        )}

        {/* Pop: Pastel garland with colorful circular disks */}
        {tpl === "pop" && (
          <svg viewBox="0 0 1000 120" className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <path
              d="M 0 15 Q 500 85 1000 15"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.6"
              strokeWidth="2"
            />
            {Array.from({ length: 18 }, (_, i) => {
              const t = (i + 0.5) / 18;
              const x = t * 1000;
              const y = (1 - t) * (1 - t) * 15 + 2 * (1 - t) * t * 85 + t * t * 15;
              const color = cols[i % cols.length];
              return (
                <circle
                  key={`pop-${i}`}
                  cx={x}
                  cy={y + 16}
                  r={12 + ((i * 7) % 8)}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity="0.9"
                />
              );
            })}
          </svg>
        )}
      </div>
    </motion.div>
  );
}

