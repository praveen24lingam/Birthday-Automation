"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

type Sparkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

const COLORS = ["#ffd166", "#ff6b6b", "#4cc9f0", "#a78bfa", "#f472b6", "#34d399"];

export function AmbientCelebration() {
  const reduce = useReducedMotion();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (reduce) return;
    // Generate 18 gentle ambient celebratory sparkles
    const list: Sparkle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 4 + ((i * 5.3 + 7) % 92),
      y: (i * 13.7) % 100,
      size: 4 + ((i * 3) % 6),
      delay: (i * 0.45) % 6,
      duration: 5 + ((i * 1.7) % 5),
      color: COLORS[i % COLORS.length],
    }));
    setSparkles(list);
  }, [reduce]);

  if (reduce || !sparkles.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="ambient-sparkle absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: 0.45,
          }}
        />
      ))}
    </div>
  );
}

