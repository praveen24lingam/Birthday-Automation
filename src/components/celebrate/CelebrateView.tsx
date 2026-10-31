"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { Person, Wish, Memory, TemplateKey } from "@/lib/data/types";
import { CelebrateChrome } from "./CelebrateChrome";
import { DiyaStage } from "./DiyaStage";
import { SparkName } from "./SparkName";
import { TemplateGarland } from "./TemplateGarland";
import { CelebrationCake3D } from "./CelebrationCake3D";
import { LetterUnfold } from "./LetterUnfold";
import { SkyLanterns } from "./SkyLanterns";
import { firstName } from "@/lib/utils";

export type CelebrateViewProps = {
  celebrants: Person[];
  isGroup: boolean;
  tpl: TemplateKey;
  wishes: Wish[];
  memories: Memory[];
};

type Step = "open" | "reveal" | "garland" | "cake" | "letter" | "finale";

export function CelebrateView({
  celebrants,
  isGroup,
  tpl,
  wishes,
  memories,
}: CelebrateViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("open");
  const [diyaLit, setDiyaLit] = useState(false);
  const [nameIndex, setNameIndex] = useState(0);
  const [nameSettled, setNameSettled] = useState(false);
  const [activePersonIndex, setActivePersonIndex] = useState(0);

  const flameRef = useRef<HTMLDivElement>(null);
  const [flamePos, setFlamePos] = useState<{ x: number; y: number } | null>(null);

  const activePerson = celebrants[activePersonIndex] || celebrants[0];

  // Names list for spark writing:
  // In single mode: [Person.name]
  // In group mode: [Person 1, Person 2, ..., "Everyone!"]
  const namesToWrite = isGroup
    ? [...celebrants.map((p) => p.name), celebrants.map((p) => firstName(p.name)).join(" & ")]
    : [activePerson?.name || "Birthday Star"];

  // Measure flame position on stage
  const updateFlamePos = useCallback(() => {
    if (flameRef.current) {
      const rect = flameRef.current.getBoundingClientRect();
      setFlamePos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.3,
      });
    }
  }, []);

  useEffect(() => {
    updateFlamePos();
    window.addEventListener("resize", updateFlamePos);
    return () => window.removeEventListener("resize", updateFlamePos);
  }, [updateFlamePos]);

  // Step 1 -> 2: Light the diya
  const handleLightDiya = () => {
    setDiyaLit(true);
    updateFlamePos();
    setTimeout(() => {
      setStep("reveal");
    }, 1200);
  };

  // Spark text callback when a name finishes writing
  const handleNameSettled = useCallback((index: number) => {
    setNameSettled(true);
    if (isGroup && index < namesToWrite.length - 1) {
      setTimeout(() => {
        setNameSettled(false);
        setNameIndex((i) => i + 1);
      }, 2200);
    } else {
      // Advance to garland & cake
      setTimeout(() => {
        setStep("cake");
      }, 2600);
    }
  }, [isGroup, namesToWrite.length]);

  // Step 5 -> 6: Cake candles blown out
  const handleCakeBlown = () => {
    setStep("letter");
  };

  // Step 6 -> 7: Letter finished -> Finale lanterns
  const handleLetterContinue = () => {
    setStep("finale");
  };

  // Replay entire sequence
  const handleReplay = () => {
    setDiyaLit(false);
    setNameIndex(0);
    setNameSettled(false);
    setStep("open");
  };

  // Step back to read letter
  const handleReadAgain = () => {
    setStep("letter");
  };

  // Keyboard navigation (Escape = back, Space/Enter = continue)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-gradient-to-b from-[#0e071c] via-[#1a0e30] to-[#24133f]">
      {/* Chrome header with Back, Sound, and Step Controls */}
      <CelebrateChrome
        step={step}
        onNext={() => {
          if (step === "open") handleLightDiya();
          else if (step === "reveal") setStep("cake");
          else if (step === "cake") setStep("letter");
          else if (step === "letter") setStep("finale");
        }}
        canNext={step !== "finale"}
      />

      {/* Decorative template garland hanging from top */}
      <TemplateGarland tpl={tpl} active={step !== "open"} />

      {/* Main Cinematic Stages */}
      <main className="relative z-10 flex min-h-[100svh] w-full flex-col items-center justify-center pt-14 pb-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Opening & Light the Diya */}
          {step === "open" && (
            <motion.div
              key="step-open"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="flex w-full flex-col items-center text-center px-4"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-amber-300/80 mb-2">
                {isGroup ? "NavGurukul Group Celebration" : `Celebrating ${firstName(activePerson?.name || "")}`}
              </span>
              <h1 className="mb-8 font-display text-4xl text-amber-100 sm:text-6xl">
                A special day calls for a spark.
              </h1>
              <DiyaStage
                lit={diyaLit}
                onLight={handleLightDiya}
                flameRef={flameRef}
              />
            </motion.div>
          )}

          {/* STEP 2 & 3: Diya Lit & Sparks Writing Name */}
          {step === "reveal" && (
            <motion.div
              key="step-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex h-[85vh] w-full flex-col items-center justify-between px-4 py-8"
            >
              {/* Particle Sparks Canvas */}
              <SparkName
                names={namesToWrite}
                currentNameIndex={nameIndex}
                origin={flamePos}
                onNameSettled={handleNameSettled}
                active={step === "reveal"}
              />

              {/* Glowing Name Reveal Banner */}
              <div className="relative z-30 mt-14 flex flex-col items-center text-center">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-300/70">
                  {isGroup ? "Happy Birthday to all of you" : "Happy Birthday"}
                </span>
                <h2
                  className={`mt-2 font-display text-5xl text-amber-100 sm:text-7xl drop-shadow-[0_0_35px_rgba(255,180,40,0.6)] transition-all duration-700 ${
                    nameSettled ? "scale-105 opacity-100" : "scale-95 opacity-0"
                  }`}
                >
                  {namesToWrite[nameIndex]}
                </h2>
                {activePerson?.group && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={nameSettled ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    className="mt-3 inline-block rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1 text-sm font-semibold text-amber-200"
                  >
                    NavGurukul • {activePerson.group}
                  </motion.span>
                )}
              </div>

              {/* Diya remains at bottom illuminating the scene */}
              <div className="relative z-10 scale-75">
                <DiyaStage
                  lit={true}
                  onLight={() => {}}
                  flameRef={flameRef}
                  disabled
                />
              </div>
            </motion.div>
          )}

          {/* STEP 5: The 3D Cake Rises */}
          {step === "cake" && (
            <motion.div
              key="step-cake"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex w-full flex-col items-center justify-center"
            >
              <CelebrationCake3D
                tpl={tpl}
                people={celebrants}
                onBlown={handleCakeBlown}
                active={step === "cake"}
              />
            </motion.div>
          )}

          {/* STEP 6: The Unfolding 3D Paper Letter */}
          {step === "letter" && (
            <motion.div
              key="step-letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-4"
            >
              {/* If group mode, celebrants switcher tabs */}
              {isGroup && celebrants.length > 1 && (
                <div className="mx-auto mb-4 flex max-w-2xl justify-center gap-2 overflow-x-auto pb-2">
                  {celebrants.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePersonIndex(idx)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                        idx === activePersonIndex
                          ? "bg-amber-400 text-neutral-900 shadow-md"
                          : "border border-white/20 bg-black/30 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}

              <LetterUnfold
                person={activePerson}
                wishes={wishes}
                memories={memories}
                onContinue={handleLetterContinue}
                active={step === "letter"}
              />
            </motion.div>
          )}

          {/* STEP 7: Finale Sky Lanterns */}
          {step === "finale" && (
            <motion.div
              key="step-finale"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <SkyLanterns
                person={activePerson}
                wishes={wishes}
                onReadAgain={handleReadAgain}
                onReplay={handleReplay}
                active={step === "finale"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

