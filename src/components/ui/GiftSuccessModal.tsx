"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { sfx } from "@/lib/audio";

export type GiftSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
};

export function GiftSuccessModal({ isOpen, onClose, recipientName }: GiftSuccessModalProps) {
  const [opened, setOpened] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      setOpened(false);
      // Small pause before gift pops open
      const timer = setTimeout(() => {
        setOpened(true);
        sfx("pop");

        // Confetti burst from gift center
        try {
          confetti({
            particleCount: 65,
            spread: 75,
            origin: { x: 0.5, y: 0.48 },
            colors: ["#ffb020", "#ff5d86", "#18a19c", "#ffd700", "#ff6b6b"],
            zIndex: 9999,
          });
        } catch {
          // ignore
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/20 bg-gradient-to-b from-[#2a1747] via-[#201037] to-[#140826] p-7 text-center shadow-2xl"
        >
          {/* Animated 3D Gift Box */}
          <div className="relative my-4 flex h-40 w-40 items-center justify-center">
            {/* Ambient golden glow behind open gift */}
            <motion.div
              animate={opened ? { scale: [1, 1.3, 1.15], opacity: [0.3, 0.8, 0.6] } : { scale: 0.8, opacity: 0.2 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
              className="absolute h-36 w-36 rounded-full bg-amber-400/40 blur-xl"
            />

            {/* Flying stars out of the box when opened */}
            {opened && (
              <>
                {[-35, -15, 15, 35].map((deg, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.3, 0.8],
                      y: -75 - (i % 2) * 20,
                      x: deg * 1.6,
                    }}
                    transition={{ duration: 1 + i * 0.15, ease: "easeOut" }}
                    className="absolute text-xl pointer-events-none"
                  >
                    {i % 2 === 0 ? "✨" : "💛"}
                  </motion.span>
                ))}
              </>
            )}

            {/* SVG Gift Box with Popping Lid */}
            <div className="relative flex flex-col items-center">
              {/* Gift Lid */}
              <motion.div
                initial={{ y: 0, rotate: 0 }}
                animate={opened ? { y: -36, rotate: -22, x: -10 } : { y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 14 }}
                className="relative z-20"
              >
                {/* Ribbon Bow */}
                <div className="mx-auto -mb-1 flex justify-center">
                  <div className="h-4 w-5 rounded-full border-2 border-amber-300 bg-amber-400 shadow-sm" />
                  <div className="-ml-1 h-4 w-5 rounded-full border-2 border-amber-300 bg-amber-400 shadow-sm" />
                </div>
                {/* Lid top */}
                <div className="h-6 w-28 rounded-md bg-gradient-to-r from-[#ff5d86] via-[#ff789f] to-[#ff5d86] shadow-md flex items-center justify-center">
                  <div className="h-full w-5 bg-amber-400" />
                </div>
              </motion.div>

              {/* Gift Box Base */}
              <div className="relative z-10 -mt-0.5 h-20 w-24 rounded-b-xl bg-gradient-to-b from-[#e63968] to-[#b31b46] shadow-xl flex justify-center overflow-hidden">
                {/* Ribbon stripe */}
                <div className="h-full w-5 bg-amber-400" />
                {/* Ribbon horizontal highlight */}
                <div className="absolute top-6 h-4 w-full bg-amber-300/40" />
              </div>
            </div>
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-amber-300/80">
            Delivered With Love
          </span>
          <h3 className="mt-1 font-display text-2xl text-white">
            {recipientName && recipientName !== "Everyone"
              ? `Wish sent to ${recipientName}!`
              : "Wish posted to the wall!"}
          </h3>
          <p className="mt-2 text-sm text-neutral-300">
            Your heartfelt message is now glowing on the birthday board.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-neutral-900 shadow-lg shadow-amber-500/25 transition hover:scale-105 active:scale-95"
          >
            Awesome! 💖
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

