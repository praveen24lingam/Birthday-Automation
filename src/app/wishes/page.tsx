"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBoard } from "@/components/providers";
import { WishForm } from "@/components/forms";
import { WishCard } from "@/components/posts";

export default function WishesPage() {
  const { wishes, monthPeople, ready } = useBoard();
  const [filter, setFilter] = useState("all");
  const list = wishes.filter((w) => filter === "all" || w.to === filter);
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-9">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
        <h1 className="text-[clamp(2.2rem,5vw,3.3rem)] flex items-center gap-3">
          <span>Wish wall</span>
          <span className="text-3xl anim-float">💌</span>
        </h1>
        <p className="mb-7 mt-1.5 text-muted">Short and happy. Your wish shows up for everyone the moment you post it.</p>
      </motion.div>
      <div className="grid items-start gap-7 lg:grid-cols-[360px_1fr]">
        <WishForm onPosted={() => setFilter("all")} />
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label htmlFor="wFilter" className="font-semibold">Show wishes for</label>
            <select id="wFilter" className="input w-auto min-w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All wishes</option>
              {monthPeople.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="ml-auto text-sm text-muted">{list.length} {list.length === 1 ? "wish" : "wishes"}</span>
          </div>
          {!ready ? (
            <div className="columns-1 gap-5 sm:columns-2" aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="mb-5 h-36 rounded-2xl bg-line/30 p-5 shadow animate-pulse flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-5/6 rounded bg-line/50" />
                    <div className="h-4 w-2/3 rounded bg-line/40" />
                  </div>
                  <div className="h-3 w-1/4 rounded bg-line/50" />
                </div>
              ))}
            </div>
          ) : list.length ? (
            <div className="columns-1 gap-5 sm:columns-2">
              <AnimatePresence mode="popLayout">{list.map((w) => <WishCard key={w.id} w={w} />)}</AnimatePresence>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-line p-10 text-center text-muted"><h3 className="mb-1.5 text-2xl text-ink">{filter === "all" ? "The wall is waiting" : "No wishes for them yet"}</h3><p>Write the first wish using the form.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
