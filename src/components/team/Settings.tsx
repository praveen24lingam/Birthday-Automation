"use client";
import { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useBoard } from "../providers";
import { monthName } from "@/lib/utils";
import { getAdminPin, setAdminPin } from "@/lib/data/firebase";

export function Settings() {
  const { snap, saveConfig, toast, wishes, memories, repo, viewMonth } = useBoard();
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [newPin, setNewPin] = useState("");
  useEffect(() => { setTitle(snap.config.title || ""); setSub(snap.config.subtitle || ""); }, [snap.config.title, snap.config.subtitle]);
  const approve = snap.config.approvePhotos !== false;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form className="panel grid gap-4 p-5" onSubmit={async (e) => { e.preventDefault(); await saveConfig({ title: title.trim().slice(0, 60), subtitle: sub.trim().slice(0, 90) }); toast("Board details saved"); }}>
        <h2 className="text-[1.6rem]">Board details</h2>
        <div className="field"><label htmlFor="cTitle">Board title</label><input id="cTitle" className="input" value={title} maxLength={60} placeholder="Birthday Board" onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><label htmlFor="cSub">Line under the title</label><input id="cSub" className="input" value={sub} maxLength={90} placeholder="Blow out the candles, flip the cards, leave a wish." onChange={(e) => setSub(e.target.value)} /></div>
        <button className="btn btn-primary justify-self-start">Save details</button>
        <div className="mt-2 flex items-center justify-between gap-4 border-t-2 border-line pt-4">
          <label htmlFor="approve" className="font-semibold">Approve memory photos before they show</label>
          <Switch.Root id="approve" checked={approve} onCheckedChange={async (v) => { await saveConfig({ approvePhotos: v }); toast(v ? "Photos now need approval" : "Photos now show right away"); }}
            className="relative h-7 w-12 flex-none rounded-full bg-line transition-colors data-[state=checked]:bg-accent">
            <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
          </Switch.Root>
        </div>
        <div className="mt-3 border-t-2 border-line pt-4">
          <label className="block text-sm font-semibold mb-1" htmlFor="teamPin">Change Birthday Team PIN</label>
          <div className="flex gap-2">
            <input
              id="teamPin"
              type="text"
              maxLength={10}
              placeholder={`Current PIN: ${getAdminPin()}`}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="input text-sm"
            />
            <button
              type="button"
              className="btn btn-primary flex-none text-xs"
              onClick={() => {
                if (newPin.trim().length >= 4) {
                  setAdminPin(newPin.trim());
                  toast("New team PIN saved!");
                  setNewPin("");
                } else {
                  toast("PIN must be at least 4 digits");
                }
              }}
            >
              Update PIN
            </button>
          </div>
        </div>
      </form>
      <section className="panel grid gap-3 p-5">
        <h2 className="text-[1.6rem]">Monthly clean-up</h2>
        <p className="help">On the 1st of every month, last month’s wishes, memories and memory photos are deleted automatically. People and their photos stay for next year. Nobody needs to press anything.</p>
        <p className="help">To clear {monthName(viewMonth)} early, for example after a test, use the button below.</p>
        <button type="button" className="btn btn-danger justify-self-start" onClick={async () => {
          const n = wishes.length + memories.length;
          if (!n) return toast("There’s nothing to delete.");
          if (!confirm(`Delete all ${n} wishes and memories for ${monthName(viewMonth)}? This can’t be undone.`)) return;
          for (const w of wishes) await repo.deleteWish(w.id);
          for (const m of memories) await repo.deleteMemory(m.id);
          toast(`Deleted ${n} posts`);
        }}>Delete this month’s wishes and memories</button>
      </section>
    </div>
  );
}
