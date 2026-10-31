"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import type { Person, TemplateKey } from "@/lib/data/types";
import { canUse3D } from "@/lib/three/support";
import { Cake } from "../hero/Cake";
import { sfx, audio } from "@/lib/audio";
import { bigCelebration } from "@/lib/celebrate";
import { TEMPLATES } from "@/lib/templates";

const CakeScene = dynamic(() => import("../hero/three/CakeScene"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex h-[340px] w-[260px] items-center justify-center animate-pulse opacity-60">
      <Cake />
    </div>
  ),
});

export type CelebrationCake3DProps = {
  tpl: TemplateKey;
  people: Person[];
  onBlown: () => void;
  active: boolean;
};

export function CelebrationCake3D({ tpl, people, onBlown, active }: CelebrationCake3DProps) {
  const [lit, setLit] = useState(true);
  const [isCut, setIsCut] = useState(false);
  const [cutting, setCutting] = useState(false);
  const [mode, setMode] = useState<"pending" | "3d" | "2d">("pending");
  const [listening, setListening] = useState(false);
  const cakeBtnRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMode(canUse3D() ? "3d" : "2d");
  }, []);

  const handleCut = () => {
    if (isCut || cutting) return;
    setCutting(true);
    sfx("whoosh");
    setTimeout(() => {
      setIsCut(true);
      setCutting(false);
      sfx("pop");

      const cakeRect = cakeBtnRef.current?.getBoundingClientRect();
      const origin = cakeRect
        ? { x: (cakeRect.left + cakeRect.width / 2) / window.innerWidth, y: (cakeRect.top + cakeRect.height * 0.4) / window.innerHeight }
        : { x: 0.5, y: 0.6 };

      const colors = tpl === "mehfil"
        ? ["#ffb300", "#ff7a00", "#d81b60", "#ffea00", "#ffffff"]
        : TEMPLATES[tpl]?.confetti || ["#ffb020", "#ff5d86", "#18a19c", "#9b7bff"];

      bigCelebration(colors, origin, true);

      // Advance to letter after slicing the cake!
      setTimeout(() => {
        onBlown();
      }, 2000);
    }, 600);
  };

  const handleBlow = () => {
    if (!lit) return;
    setLit(false);
    sfx("whoosh");
    if (audio.isOn()) {
      setTimeout(() => audio.birthdaySong(), 400);
    }

    const cakeRect = cakeBtnRef.current?.getBoundingClientRect();
    const origin = cakeRect
      ? { x: (cakeRect.left + cakeRect.width / 2) / window.innerWidth, y: (cakeRect.top + cakeRect.height * 0.4) / window.innerHeight }
      : { x: 0.5, y: 0.6 };

    const colors = tpl === "mehfil"
      ? ["#ffb300", "#ff7a00", "#d81b60", "#ffea00", "#ffffff"]
      : TEMPLATES[tpl]?.confetti || ["#ffb020", "#ff5d86", "#18a19c", "#9b7bff"];

    bigCelebration(colors, origin, tpl === "starlight");
    sfx("pop");
  };

  const micBlow = async () => {
    if (listening) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Microphone not available. Tap the cake instead!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setListening(true);
      const ac = new AudioContext();
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Float32Array(an.fftSize);
      let hits = 0;
      const t0 = performance.now();

      const stop = () => {
        stream.getTracks().forEach((t) => t.stop());
        ac.close();
        setListening(false);
      };

      const loop = () => {
        an.getFloatTimeDomainData(buf);
        let s = 0;
        for (const v of buf) s += v * v;
        hits = Math.sqrt(s / buf.length) > 0.12 ? hits + 1 : Math.max(0, hits - 1);
        if (hits > 7) {
          stop();
          handleBlow();
          return;
        }
        if (performance.now() - t0 > 12000) {
          stop();
          return;
        }
        requestAnimationFrame(loop);
      };
      loop();
    } catch {
      alert("Microphone access denied. Tap the cake instead!");
    }
  };

  if (!active) return null;

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { y: 220, opacity: 0, scale: 0.88 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="relative z-20 flex w-full flex-col items-center justify-center px-4"
    >
      <div className="relative h-[clamp(300px,65vw,440px)] w-[min(100vw,640px)]">
        {mode === "3d" ? (
          <div className="scene-fade absolute inset-0">
            <CakeScene
              lit={lit}
              tpl={tpl}
              people={people}
              active={active}
              onLost={() => setMode("2d")}
              isCut={isCut}
              showKnife={!lit && !isCut}
              cutting={cutting}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Cake out={!lit} />
          </div>
        )}

        {/* Tap target over the cake */}
        <button
          ref={cakeBtnRef}
          type="button"
          onClick={lit ? handleBlow : (!isCut ? handleCut : undefined)}
          disabled={!lit && isCut}
          aria-label={lit ? "Make a wish and tap to blow out the candles" : !isCut ? "Tap to cut the cake" : "Cake is sliced"}
          className="absolute inset-0 z-30 h-full w-full cursor-pointer rounded-3xl bg-transparent outline-none focus-visible:ring-4 focus-visible:ring-amber-400/80"
        />
      </div>

      {/* Call to action & hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-center"
      >
        {lit ? (
          <>
            <p className="text-xl font-bold tracking-wide text-amber-100 sm:text-2xl drop-shadow">
              Make a wish, then tap the candles
            </p>
            <button
              type="button"
              onClick={micBlow}
              className="mt-2 inline-block text-sm text-amber-200/80 underline decoration-amber-400/40 hover:text-amber-100 transition"
            >
              {listening ? "Listening... Blow now! 💨" : "Or blow into your microphone 🎤"}
            </button>
          </>
        ) : !isCut ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-bold tracking-wide text-amber-300 drop-shadow animate-pulse">
              Now cut the cake! 🔪🎂
            </p>
            <button
              type="button"
              onClick={handleCut}
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
            >
              Cut the Slice ✨
            </button>
          </div>
        ) : (
          <p className="text-2xl font-display text-amber-200 drop-shadow">
            Happy Birthday! Reading your letter... ✨
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

