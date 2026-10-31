"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { Person, Wish, Memory } from "@/lib/data/types";
import { Avatar } from "../ui/Avatar";
import { firstName, fmtBday } from "@/lib/utils";

export type LetterUnfoldProps = {
  person: Person;
  wishes: Wish[];
  memories: Memory[];
  onContinue: () => void;
  active: boolean;
};

export function LetterUnfold({ person, wishes, memories, onContinue, active }: LetterUnfoldProps) {
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const noteText =
    person.note?.trim() ||
    `Wishing you a year as bright as the work you do. Thank you for the care, patience, and spark you bring to every day at NavGurukul. Here’s to new beginnings, big learning, and plenty of reasons to smile. Have the most wonderful birthday!`;

  const words = noteText.split(/\s+/).filter(Boolean);

  // Word-by-word reveal
  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setRevealedWordCount(words.length);
      return;
    }

    setRevealedWordCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setRevealedWordCount(current);
      if (current >= words.length) {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [active, reduce, words.length]);

  if (!active) return null;

  const celebrantName = firstName(person.name);
  const personWishes = wishes.filter((w) => w.to === person.id || w.to === "all");
  const personMemories = memories.filter(
    (m) => m.about === person.id && (!m.photoStatus || m.photoStatus === "approved")
  );

  return (
    <>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -75, y: 60 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 15,
          mass: 1.1,
        }}
        style={{ perspective: 1200, transformOrigin: "top center" }}
        className="relative z-20 mx-auto my-6 max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fdfbf6] p-6 text-[#291b12] shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-10"
      >
        {/* Parchment border & texture accents */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#e8dcc4] shadow-[inset_0_0_40px_rgba(215,190,140,0.2)]" />

        {/* Letter Header */}
        <div className="relative mb-8 flex flex-col items-center gap-3 border-b border-[#e6dbc7] pb-6 sm:flex-row sm:items-center">
          <Avatar
            person={person}
            className="h-20 w-20 rounded-full border-4 border-[#fff9eb] text-3xl shadow-md sm:h-24 sm:w-24"
          />
          <div className="text-center sm:text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#a8743b]">
              NavGurukul Birthday Letter
            </span>
            <h2 className="font-display text-3xl text-[#2a1708] sm:text-4xl">{person.name}</h2>
            <div className="mt-1 flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#8c6543] sm:justify-start">
              <span>Birthday: {fmtBday(person.bday, true)}</span>
              {person.group && <span>• {person.group}</span>}
            </div>
          </div>
        </div>

        {/* Letter Body */}
        <div className="relative space-y-4">
          <h3 className="font-display text-2xl text-[#b4430a]">Dear {celebrantName},</h3>
          <p className="font-serif text-lg leading-relaxed text-[#3a2717] sm:text-xl">
            {words.slice(0, revealedWordCount).map((w, i) => (
              <span key={i} className="inline-block whitespace-pre">
                {w}{" "}
              </span>
            ))}
          </p>
          <div className="pt-4 text-right">
            <p className="font-display text-xl italic text-[#b4430a]">With love,</p>
            <p className="font-bold text-[#4a301d]">Team NavGurukul</p>
          </div>
        </div>

        {/* Wishes from Colleagues */}
        {personWishes.length > 0 && (
          <div className="relative mt-10 border-t border-[#e6dbc7] pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-2xl text-[#2a1708]">Wishes from colleagues</h4>
              <span className="rounded-full bg-[#f0e4cc] px-3 py-0.5 text-xs font-bold text-[#734e2c]">
                {personWishes.length} {personWishes.length === 1 ? "wish" : "wishes"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {personWishes.map((w, idx) => (
                <motion.div
                  key={w.id}
                  initial={reduce ? false : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                  className="rounded-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor:
                      idx % 3 === 0 ? "#ffeaa7" : idx % 3 === 1 ? "#ffd6e0" : "#dff9fb",
                    color: "#2d3436",
                  }}
                >
                  <p className="font-hand text-lg leading-snug">{w.text}</p>
                  <span className="mt-2 block text-right font-sans text-xs font-bold opacity-75">
                    — {w.from}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Memories & Photos */}
        {personMemories.length > 0 && (
          <div className="relative mt-10 border-t border-[#e6dbc7] pt-8">
            <h4 className="mb-4 font-display text-2xl text-[#2a1708]">Memories &amp; Moments</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {personMemories.map((m) => (
                <div
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-[#e6dbc7] bg-white p-3 shadow-sm"
                >
                  {m.photo && (
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(m.photo || null)}
                      className="group relative mb-2 block aspect-video w-full overflow-hidden rounded-xl bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.photo}
                        alt={`Memory with ${person.name}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        Tap to enlarge 🔍
                      </span>
                    </button>
                  )}
                  <p className="text-sm leading-relaxed text-[#3a2717]">{m.text}</p>
                  <span className="mt-2 block text-xs font-semibold text-[#8c6543]">
                    Shared by {m.from}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue to Sky Lanterns Finale */}
        <div className="mt-10 flex justify-center border-t border-[#e6dbc7] pt-6">
          <button
            type="button"
            onClick={onContinue}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b4430a] to-[#d85a15] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-900/20 transition hover:scale-105 hover:shadow-orange-900/35 active:scale-95"
          >
            <span>See the finale</span>
            <span className="transition-transform group-hover:translate-x-1">✨</span>
          </button>
        </div>
      </motion.div>

      {/* Lightbox for memories */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <div className="relative max-h-[90vh] max-w-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto}
                alt="Enlarged memory"
                className="max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute -right-3 -top-3 rounded-full bg-white px-3 py-1 text-sm font-bold text-black shadow-lg hover:bg-neutral-200"
              >
                ✕ Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

