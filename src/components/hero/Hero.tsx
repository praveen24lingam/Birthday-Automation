"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useBoard } from "../providers";
import { HeroCake } from "./HeroCake";
import { SplitReveal } from "./SplitReveal";
import { Decorations } from "./Decorations";
import { audio, sfx } from "@/lib/audio";
import { bigCelebration } from "@/lib/celebrate";
import { TEMPLATES } from "@/lib/templates";
import { curMonth, monthName } from "@/lib/utils";

function Letters({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-label={text} role="text">
      {Array.from(text).map((ch, i) => (
        <motion.span key={`${text}-${i}`} aria-hidden className="inline-block whitespace-pre"
          initial={reduce ? false : { y: 40, opacity: 0, rotate: i % 2 ? 8 : -8 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: delay + i * 0.03 }}>
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const { snap, tpl, viewMonth, monthPeople } = useBoard();
  const [lit, setLit] = useState(true);
  const [isCut, setIsCut] = useState(false);
  const [cutting, setCutting] = useState(false);
  const [listening, setListening] = useState(false);
  const [musicOn, setMusicOn] = useState(audio.isOn());
  const cakeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const title = snap.config.title?.trim() || "Birthday Board";
  const sub = snap.config.subtitle?.trim() || "Blow out the candles, flip the cards, leave a wish.";

  const cutCake = () => {
    if (isCut || cutting) return;
    setCutting(true);
    sfx("flip");
    setTimeout(() => {
      setIsCut(true);
      setCutting(false);
      sfx("pop");
      const r = cakeRef.current?.getBoundingClientRect();
      bigCelebration(
        ["#ffd700", "#ff69b4", "#ff4500", "#00ffff", "#ffffff"],
        r ? { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.4) / innerHeight } : { x: 0.5, y: 0.5 }
      );
    }, 600);
  };

  const blow = () => {
    if (!lit) return;
    setLit(false);
    if (audio.isOn()) { audio.sfx("whoosh"); setTimeout(() => audio.birthdaySong(), 500); }
    setMusicOn(audio.isOn());
    setTimeout(() => {
      const r = cakeRef.current?.getBoundingClientRect();
      bigCelebration(TEMPLATES[tpl].confetti, r ? { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.3) / innerHeight } : { x: 0.5, y: 0.5 }, tpl === "starlight");
      if (audio.isOn()) audio.sfx("pop");
    }, reduce ? 0 : 420);
  };

  const micBlow = async () => {
    if (listening) return;
    if (!navigator.mediaDevices?.getUserMedia) { alert("The microphone isn’t available here. Tap the cake instead."); return; }
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { alert("The microphone is off for this page. Tap the cake instead."); return; }
    setListening(true);
    const ac = new AudioContext(), an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize); let hits = 0; const t0 = performance.now();
    const stop = () => { stream.getTracks().forEach((t) => t.stop()); ac.close(); setListening(false); };
    const loop = () => {
      an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v;
      hits = Math.sqrt(s / buf.length) > 0.12 ? hits + 1 : Math.max(0, hits - 1);
      if (hits > 8) { stop(); blow(); return; }
      if (performance.now() - t0 > 12000) { stop(); return; }
      requestAnimationFrame(loop);
    };
    loop();
  };

  return (
    <section className="hero min-h-[660px] px-4 pb-14 pt-24 text-center sm:pt-28" aria-labelledby="hero-title">
      <Decorations tpl={tpl} people={monthPeople} />
      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.span initial={reduce ? false : { y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="mb-3 inline-block rounded-full bg-[var(--a1)] px-4 py-1 text-sm font-bold text-[#1a1033] shadow">
          {monthName(viewMonth)}{viewMonth !== curMonth() ? " (preview)" : ""}
        </motion.span>
        <h1 id="hero-title" className="text-[clamp(2.8rem,9vw,5.2rem)] drop-shadow-sm" style={{ color: "var(--hero-ink)" }}>
          <Letters text={title} delay={0.15} />
        </h1>
        <motion.p initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mx-auto mt-2 max-w-[46ch] text-lg" style={{ color: "var(--hero-muted)" }}>{sub}</motion.p>

        <HeroCake
          lit={lit}
          onBlow={blow}
          tpl={tpl}
          people={monthPeople}
          buttonRef={cakeRef}
          isCut={isCut}
          showKnife={!lit && !isCut}
          cutting={cutting}
          onCut={cutCake}
        />

        <AnimatePresence mode="wait">
          {lit ? (
            <motion.div key="lit" exit={{ opacity: 0, y: 8 }} className="mt-3">
              <p className="text-[1.08rem] font-semibold">Tap the cake to blow out the candles</p>
              <button type="button" onClick={micBlow} className="link mt-2" style={{ color: "var(--hero-muted)", fontSize: ".92rem" }}>
                {listening ? "Listening. Blow now!" : "Or blow into your microphone"}
              </button>
            </motion.div>
          ) : !isCut ? (
            <motion.div key="cut-prompt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <p className="font-display text-2xl text-[var(--a1)] animate-pulse">Now tap the cake to cut a slice! 🔪🎂</p>
              <button type="button" onClick={cutCake} className="btn mt-2 border-[var(--a1)] bg-[var(--a1)] text-[#1a1033] shadow-md font-bold">
                Slice the Cake ✨
              </button>
            </motion.div>
          ) : (
            <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3" aria-live="polite">
              <p className="font-display text-[clamp(2.6rem,10vw,4.4rem)] leading-none" style={{ color: tpl === "pinboard" || tpl === "pop" ? "var(--t-accent)" : "var(--a1)" }}>
                <SplitReveal text="Happy Birthday!" delay={0.1} />
              </p>
              <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <p className="mb-4 mt-2 font-medium" style={{ color: "var(--hero-muted)" }}>A sweet slice for everyone! Make a wish, then leave one for the birthday crew.</p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  <Link href="/wishes/" className="btn border-[var(--a1)] bg-[var(--a1)] text-[#1a1033]">Write a wish</Link>
                  {!musicOn && <button type="button" className="btn border-current/30 bg-white/10" style={{ color: "var(--hero-ink)" }} onClick={async () => { await audio.setMusic(true); setMusicOn(true); audio.birthdaySong(); }}>Play the birthday song</button>}
                  <button
                    type="button"
                    className="btn border-current/30 bg-white/10"
                    style={{ color: "var(--hero-ink)" }}
                    onClick={() => {
                      setLit(true);
                      setIsCut(false);
                    }}
                  >
                    Relight the candles
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
