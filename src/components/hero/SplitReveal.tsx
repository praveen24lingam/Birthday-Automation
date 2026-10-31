"use client";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "@/lib/three/support";

/**
 * Letters tumble in one by one (GSAP SplitText), then ripple gently.
 * SplitText keeps an aria-label on the element, so screen readers hear the whole phrase.
 */
export function SplitReveal({ text, className, style, delay = 0 }: { text: string; className?: string; style?: CSSProperties; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(SplitText);
    const ctx = gsap.context(() => {
      const split = SplitText.create(el, { type: "chars", charsClass: "inline-block" });
      gsap.from(split.chars, { yPercent: -140, opacity: 0, scale: 0.3, rotation: () => gsap.utils.random(-30, 30), duration: 1, ease: "elastic.out(1,0.5)", stagger: 0.05, delay });
      gsap.to(split.chars, { y: -7, duration: 0.7, ease: "sine.inOut", delay: delay + 1.4, stagger: { each: 0.07, repeat: -1, yoyo: true } });
    }, el);
    return () => ctx.revert();
  }, [text, delay]);
  return <span ref={ref} className={className} style={style}>{text}</span>;
}
