"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBoard } from "@/components/providers";
import { MemoryForm } from "@/components/forms";
import { MemoryItem } from "@/components/posts";

export default function MemoriesPage() {
  const { memories, monthPeople, ready } = useBoard();
  const [filter, setFilter] = useState("all");
  const list = memories.filter((m) => filter === "all" || m.about === filter);
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-9">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
        <h1 className="text-[clamp(2.2rem,5vw,3.3rem)] flex items-center gap-3">
          <span>Special memories</span>
          <span className="text-3xl anim-float">🎞️</span>
        </h1>
        <p className="mb-7 mt-1.5 text-muted">A story, a moment, an old photo. Longer and more personal than a wish.</p>
      </motion.div>
      <div className="grid items-start gap-7 lg:grid-cols-[360px_1fr]">
        <MemoryForm />
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label htmlFor="mFilter" className="font-semibold">Show memories about</label>
            <select id="mFilter" className="input w-auto min-w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Everyone</option>
              {monthPeople.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="ml-auto text-sm text-muted">{list.length} {list.length === 1 ? "memory" : "memories"}</span>
          </div>
          {!ready ? (
            <div className="ml-2 grid gap-5 border-l-[3px] border-line pl-6" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-40 rounded-3xl border-2 border-line bg-surface/50 p-4 shadow animate-pulse flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-line/60" />
                    <div className="h-5 w-40 rounded bg-line/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-5/6 rounded bg-line/40" />
                    <div className="h-4 w-1/2 rounded bg-line/30" />
                  </div>
                  <div className="h-3 w-1/4 rounded bg-line/40" />
                </div>
              ))}
            </div>
          ) : list.length ? (
            <ol className="ml-2 grid gap-5 border-l-[3px] border-line pl-6">
              <AnimatePresence mode="popLayout">{list.map((m) => <MemoryItem key={m.id} m={m} />)}</AnimatePresence>
            </ol>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-line p-10 text-center text-muted"><h3 className="mb-1.5 text-2xl text-ink">No memories here yet</h3><p>Share a story or an old photo using the form.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
