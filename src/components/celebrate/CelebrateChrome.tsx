"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

export type CelebrateChromeProps = {
  step: "open" | "reveal" | "garland" | "cake" | "letter" | "finale";
  onNext: () => void;
  canNext: boolean;
};

export function CelebrateChrome({ step, onNext, canNext }: CelebrateChromeProps) {
  const [musicOn, setMusicOn] = useState(audio.isOn());

  useEffect(() => {
    return audio.onChange((on) => setMusicOn(on));
  }, []);

  const toggleSound = async () => {
    const nextState = !musicOn;
    await audio.setMusic(nextState);
    setMusicOn(nextState);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-black/60 active:scale-95 no-underline"
      >
        <span>←</span>
        <span>Birthday Board</span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-mono text-amber-200/80 backdrop-blur">
          <span className={step === "open" ? "text-amber-300 font-bold" : "opacity-40"}>Diya</span>
          <span className="opacity-30">•</span>
          <span className={step === "reveal" ? "text-amber-300 font-bold" : "opacity-40"}>Name</span>
          <span className="opacity-30">•</span>
          <span className={step === "cake" ? "text-amber-300 font-bold" : "opacity-40"}>Cake</span>
          <span className="opacity-30">•</span>
          <span className={step === "letter" ? "text-amber-300 font-bold" : "opacity-40"}>Letter</span>
          <span className="opacity-30">•</span>
          <span className={step === "finale" ? "text-amber-300 font-bold" : "opacity-40"}>Lanterns</span>
        </div>

        {/* Skip/Next button for accessible progression */}
        {canNext && step !== "finale" && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-full border border-amber-300/30 bg-amber-400/20 px-3 py-1.5 text-xs font-bold text-amber-200 backdrop-blur transition hover:bg-amber-400/30 active:scale-95"
          >
            Skip →
          </button>
        )}

        {/* Sound toggle button (off by default) */}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={musicOn}
          aria-label={musicOn ? "Mute music and audio" : "Turn sound on"}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition backdrop-blur active:scale-90 ${
            musicOn
              ? "border-amber-400/80 bg-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(255,180,40,0.4)]"
              : "border-white/20 bg-black/40 text-white/70 hover:text-white"
          }`}
        >
          {musicOn ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" fillOpacity="0.2" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" fillOpacity="0.2" />
              <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
              <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

