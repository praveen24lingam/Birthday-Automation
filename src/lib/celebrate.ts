"use client";
import confetti from "canvas-confetti";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function bigCelebration(colors: string[], origin: { x: number; y: number }, stars = false) {
  if (reduced()) return;
  const base = { colors, zIndex: 80, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 130, spread: 95, startVelocity: 45, origin });
  setTimeout(() => {
    confetti({ ...base, particleCount: 80, angle: 60, spread: 60, startVelocity: 58, origin: { x: 0, y: 0.85 } });
    confetti({ ...base, particleCount: 80, angle: 120, spread: 60, startVelocity: 58, origin: { x: 1, y: 0.85 } });
  }, 250);
  const end = Date.now() + 1800;
  (function frame() {
    confetti({ ...base, particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
    confetti({ ...base, particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  if (stars) {
    try {
      const star = confetti.shapeFromText({ text: "★", scalar: 2 });
      setTimeout(() => confetti({ ...base, shapes: [star], scalar: 2, particleCount: 40, spread: 120, origin }), 500);
    } catch { /* older browsers */ }
  }
}

export function smallBurst(colors: string[], el: HTMLElement | null) {
  if (reduced() || !el) return;
  const r = el.getBoundingClientRect();
  confetti({ colors, zIndex: 80, particleCount: 45, spread: 65, startVelocity: 26, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight } });
}
