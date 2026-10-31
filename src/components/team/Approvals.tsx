"use client";
import { AnimatePresence, motion } from "motion/react";
import { useBoard } from "../providers";

export function Approvals() {
  const { pending, repo, toast } = useBoard();
  return (
    <div>
      <p className="mb-5 text-sm text-muted">Photos people add to memories wait here until someone on the team approves them. The memory text shows right away. Remove any wish or memory straight from the wall with its Remove link.</p>
      {!pending.length ? (
        <div className="rounded-3xl border-2 border-dashed border-line p-10 text-center text-muted"><h3 className="mb-1.5 text-2xl text-ink">Nothing to approve</h3><p>New memory photos will show up here.</p></div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          <AnimatePresence>
            {pending.map((m) => (
              <motion.article key={m.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85, y: -20 }} className="overflow-hidden rounded-2xl border-2 border-line bg-surface">
                <img src={m.photo} alt={`Photo shared about ${m.aboutName}`} className="h-44 w-full object-cover" />
                <div className="grid gap-2.5 p-3">
                  <p className="text-sm text-muted"><b className="text-ink">{m.from}</b> shared this about <b className="text-ink">{m.aboutName}</b></p>
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-sm btn-primary" onClick={async () => { await repo.updateMemory(m.id, { photoStatus: "approved" }); toast("Photo approved"); }}>Approve</button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={async () => { if (confirm("Remove this photo? The memory text stays.")) { await repo.updateMemory(m.id, { photo: "", photoStatus: "rejected" }); toast("Photo removed"); } }}>Reject</button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
