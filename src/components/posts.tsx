"use client";
import { forwardRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import type { Memory, Wish } from "@/lib/data/types";
import { useBoard } from "./providers";
import { Avatar } from "./ui/Avatar";
import { ago, hash } from "@/lib/utils";

function RemoveButton({ label, onRemove }: { label: string; onRemove: () => Promise<void> }) {
  const { toast } = useBoard();
  return (
    <button type="button" className="link" aria-label={`Remove ${label}`} onClick={async () => {
      if (!confirm(`Remove this ${label} for everyone?`)) return;
      try { await onRemove(); toast("Removed"); } catch { toast("Couldn’t remove it."); }
    }}>Remove</button>
  );
}

export const WishCard = forwardRef<HTMLElement, { w: Wish }>(function WishCard({ w }, ref) {
  const { canRemove, isTeam, repo, toast } = useBoard();
  const n = (hash(w.id) % 5) + 1, tilt = ((hash(w.id + "t") % 5) - 2) * 0.6;
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: tilt }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -6, rotate: 0, scale: 1.025, transition: { type: "spring", stiffness: 340, damping: 16 } }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="pin group relative mb-5 break-inside-avoid rounded-[4px_20px_20px_20px] p-5 pb-3.5 shadow-md hover:shadow-2xl transition-shadow cursor-default"
      style={{ background: `var(--note${n})`, color: "var(--note-ink)" }}
    >
      {/* Decorative washi tape */}
      <span className="absolute -top-2.5 left-7 block h-3.5 w-12 rounded-sm bg-black/15 -rotate-2 shadow-sm transition-transform duration-300 group-hover:rotate-0" />
      {w.pinned && <span className="absolute right-3 top-3 rounded-full bg-[var(--a1)] px-2.5 py-0.5 text-xs font-bold text-[#1a1033] shadow-sm animate-pulse">Pinned ⭐</span>}
      <div className="hand mb-1 font-display text-lg flex items-center gap-1.5">
        <span>{w.to === "all" ? "For everyone" : `For ${w.toName}`}</span>
        <span className="text-sm opacity-60">💌</span>
      </div>
      <p className="hand mb-3 whitespace-pre-wrap break-words font-hand text-[1.05rem] leading-relaxed">{w.text}</p>
      <footer className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm opacity-90 border-t border-black/10 pt-2">
        <b>{w.from}</b><span className="opacity-80 text-xs">{ago(w.createdAt)}</span>
        <span className="ml-auto flex gap-3">
          {isTeam && <button type="button" className="link text-xs" onClick={() => repo.updateWish(w.id, { pinned: !w.pinned }).then(() => toast(w.pinned ? "Unpinned" : "Pinned to the top"))}>{w.pinned ? "Unpin" : "Pin"}</button>}
          {canRemove(w) && <RemoveButton label="wish" onRemove={() => repo.deleteWish(w.id)} />}
        </span>
      </footer>
    </motion.article>
  );
});

export function Lightbox({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#080512]/85 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[min(92vw,1000px)] -translate-x-1/2 -translate-y-1/2 outline-none">
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <motion.img initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} src={src} alt={alt} className="mx-auto max-h-[82vh] rounded-2xl shadow-2xl" />
          <Dialog.Close className="btn mx-auto mt-3 flex">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const MemoryItem = forwardRef<HTMLLIElement, { m: Memory }>(function MemoryItem({ m }, ref) {
  const { findPerson, canRemove, isTeam, viewer, repo } = useBoard();
  const p = findPerson(m.about) || { id: m.about, name: m.aboutName || "Someone" };
  const mine = viewer && m.uid === viewer.uid;
  const showPhoto = m.photo && (m.photoStatus !== "pending" || isTeam || mine);
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      whileHover={{ x: 6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="relative rounded-3xl border-2 border-line bg-surface p-5 shadow-sm hover:shadow-lg transition-all before:absolute before:-left-[37px] before:top-6 before:h-4 before:w-4 before:rounded-full before:border-[3px] before:border-bg before:bg-[var(--a1)] before:shadow-[0_0_8px_rgba(255,180,40,0.6)]"
    >
      <header className="mb-2.5 flex items-center gap-3">
        <Avatar person={p} className="h-11 w-11 flex-none rounded-full text-base shadow-sm" />
        <h3 className="text-[1.4rem] font-display">About {p.name}</h3>
      </header>
      {showPhoto && (
        <Lightbox src={m.photo!} alt={`Photo shared about ${p.name}`}>
          <button type="button" className="mb-3 block w-full max-w-md overflow-hidden rounded-2xl" aria-label={`Open photo shared about ${p.name}`}>
            <motion.img src={m.photo} alt={`Photo shared about ${p.name}`} onLoad={() => setLoaded(true)} initial={{ opacity: 0, scale: 1.04 }} animate={loaded ? { opacity: 1, scale: 1 } : {}} className="max-h-80 w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
          </button>
        </Lightbox>
      )}
      {m.photo && m.photoStatus === "pending" && (isTeam || mine) && <span className="mb-3 inline-block rounded-xl border-2 border-dashed border-line px-3 py-1.5 text-sm font-semibold text-muted">Photo waiting for the birthday team to approve</span>}
      {m.text && <p className="mb-3 max-w-[70ch] whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>}
      <footer className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted">
        <span>Shared by <b className="text-ink">{m.from}</b></span><span>{ago(m.createdAt)}</span>
        {canRemove(m) && <span className="ml-auto"><RemoveButton label="memory" onRemove={() => repo.deleteMemory(m.id)} /></span>}
      </footer>
    </motion.li>
  );
});
