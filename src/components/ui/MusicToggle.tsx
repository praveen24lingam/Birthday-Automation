"use client";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";
import { motion } from "motion/react";

export function MusicToggle({ className = "" }: { className?: string }) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => audio.onChange(setOn), []);
  return (
    <button
      type="button"
      onClick={async () => { setBusy(true); try { await audio.setMusic(!on); } finally { setBusy(false); } }}
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Turn music on"}
      title={on ? "Music on" : "Music off"}
      disabled={busy}
      className={`relative grid h-10 w-10 place-items-center rounded-full border-2 border-white/25 text-white hover:border-[var(--a1)] ${className}`}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-current"
            initial={{ height: "30%" }}
            animate={on ? { height: ["30%", "100%", "45%", "85%", "30%"] } : { height: "30%" }}
            transition={on ? { duration: 1 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 } : { duration: 0.3 }}
          />
        ))}
      </span>
      {!on && <span className="absolute h-[2px] w-6 rotate-45 rounded bg-current" aria-hidden />}
    </button>
  );
}
