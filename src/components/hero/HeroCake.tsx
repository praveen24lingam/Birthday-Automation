"use client";
import { Component, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import type { Person, TemplateKey } from "@/lib/data/types";
import { canUse3D } from "@/lib/three/support";
import { Cake } from "./Cake";

/** the 2D cake shows while the 3D scene streams in */
function Loading() {
  return (
    <div className="absolute inset-x-0 bottom-[6%] mx-auto w-[min(260px,62vw)] animate-pulse opacity-60">
      <Cake />
    </div>
  );
}
const CakeScene = dynamic(() => import("./three/CakeScene"), { ssr: false, loading: Loading });

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const SCENE_TEXT: Record<TemplateKey, string> = {
  party: "A two-tier birthday cake on a stand, with balloons, curly streamers and gifts around it.",
  mehfil: "A maroon and gold cake wrapped in marigolds, with paper lanterns overhead and clay diyas glowing on the table.",
  pinboard: "A birthday cake in front of a line of polaroids of this month’s birthday people, with balloons either side.",
  starlight: "A navy and gold cake under a crescent moon, with gold stars and a sky full of tiny stars.",
  pop: "A pastel cake with big shiny balloons, wrapped gifts and confetti drifting down.",
};

type Props = {
  lit: boolean;
  onBlow: () => void;
  tpl: TemplateKey;
  people: Person[];
  buttonRef: RefObject<HTMLButtonElement | null>;
  isCut?: boolean;
  showKnife?: boolean;
  cutting?: boolean;
  onCut?: () => void;
};

export function HeroCake({ lit, onBlow, tpl, people, buttonRef, isCut = false, showKnife = false, cutting = false, onCut }: Props) {
  const [mode, setMode] = useState<"pending" | "3d" | "2d">("pending");
  const [onScreen, setOnScreen] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMode(canUse3D() ? "3d" : "2d");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => { if (mq.matches) setMode("2d"); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // stop drawing when the hero scrolls out of view
  useEffect(() => {
    const el = box.current; if (!el || mode !== "3d") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode === "2d") {
    return (
      <motion.button ref={buttonRef} type="button" onClick={onBlow} disabled={!lit} aria-label={lit ? "Blow out the candles" : "Candles are out"}
        initial={reduce ? false : { y: 90, scale: 0.8, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 11, delay: 0.5 }}
        whileHover={lit ? { scale: 1.03, rotate: -1 } : undefined} whileTap={lit ? { scale: 0.97 } : undefined}
        className="mx-auto mt-5 block w-[min(330px,80vw)] rounded-3xl bg-transparent [-webkit-tap-highlight-color:transparent] disabled:cursor-default">
        <Cake out={!lit} />
      </motion.button>
    );
  }

  return (
    <div ref={box} className="relative left-1/2 mt-1 h-[clamp(360px,96vw,500px)] w-[min(100vw,880px)] -translate-x-1/2">
      <div className="scene-fade absolute inset-0" aria-hidden>
        {mode === "3d" ? (
          <SceneBoundary onError={() => setMode("2d")}>
            <CakeScene
              lit={lit}
              tpl={tpl}
              people={people}
              active={onScreen}
              onLost={() => setMode("2d")}
              isCut={isCut}
              showKnife={showKnife}
              cutting={cutting}
            />
          </SceneBoundary>
        ) : <Loading />}
      </div>
      <p className="sr-only">{SCENE_TEXT[tpl]} {lit ? "Three candles are lit." : "The candles are out and the balloons have popped."}</p>
      {/* the cake itself is a real button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={lit ? onBlow : (!isCut ? onCut : undefined)}
        disabled={!lit && isCut}
        aria-label={lit ? "Blow out the candles" : !isCut ? "Cut the cake" : "Cake is sliced"}
        className="absolute bottom-[4%] left-1/2 h-[72%] w-[min(50%,340px)] -translate-x-1/2 touch-manipulation rounded-[40%] bg-transparent [-webkit-tap-highlight-color:transparent] cursor-pointer disabled:cursor-default"
      />
    </div>
  );
}
