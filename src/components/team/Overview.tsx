"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useBoard } from "../providers";
import { TEMPLATES, TEMPLATE_KEYS } from "@/lib/templates";
import { curMonth, fmtBday, monthOnly } from "@/lib/utils";

const BOARD_URL = typeof window !== "undefined" ? window.location.origin : "";

export function Overview() {
  const { monthPeople, wishes, memories, pending, tpl, viewMonth, snap, saveConfig, toast } = useBoard();
  const [msg, setMsg] = useState("");
  const [edited, setEdited] = useState(false);
  const month = monthOnly(viewMonth);

  useEffect(() => {
    if (edited) return;
    const names = monthPeople.map((p) => `${p.name} (${fmtBday(p.bday)})`).join(", ");
    setMsg(`🎂 It’s ${month}! Time to celebrate this month’s birthday stars.\n\n${names ? names + "\n\n" : ""}Open the Birthday Board, blow out the candles, flip their cards, leave a wish and share a memory or an old photo 💛\n${BOARD_URL}\n\nPeople & Culture Team | NavGurukul`);
  }, [monthPeople, month, edited]);

  const choose = async (k: keyof typeof TEMPLATES) => {
    const keep: Record<string, typeof k> = {};
    Object.entries({ ...(snap.config.templates || {}), [viewMonth]: k }).forEach(([m, v]) => { if (m >= curMonth()) keep[m] = v; });
    await saveConfig({ templates: keep });
    toast(`${TEMPLATES[k].name} is now the look for ${month}`);
  };

  const stats = [["birthdays", monthPeople.length], ["wishes", wishes.length], ["memories", memories.length], ["photos waiting", pending.length]] as const;
  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, n], i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="panel px-4 py-3">
            <b className="block font-display text-4xl leading-tight text-accent">{n}</b><span className="text-sm text-muted">{label}</span>
          </motion.div>
        ))}
      </div>

      <section>
        <h2 className="text-[1.7rem]">Template for {month}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">Pick a look for the month. Everyone sees it right away, and next month can have a different one. Each template comes with its own decorations and music.</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">
          {TEMPLATE_KEYS.map((k) => {
            const t = TEMPLATES[k], on = tpl === k;
            return (
              <motion.button key={k} type="button" aria-pressed={on} onClick={() => choose(k)} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                className={`flex flex-col overflow-hidden rounded-2xl border-[2.5px] bg-surface text-left ${on ? "border-accent ring-4 ring-accent/25" : "border-line"}`}>
                <span className="relative block h-24" style={{ background: t.swatch }}>
                  <span className="absolute bottom-2 left-2.5 flex gap-1">{t.cols.map((c) => <i key={c} className="h-3.5 w-3.5 rounded-full border-2 border-white/70" style={{ background: c }} />)}</span>
                </span>
                <span className="block p-3">
                  <b className="block">{t.name}</b>
                  <span className="block text-sm leading-snug text-muted">{t.desc}</span>
                  {on && <span className="mt-1.5 block text-xs font-bold text-accent">In use for {month}</span>}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="panel grid gap-3 p-5">
        <h2 className="text-[1.6rem]">Message for #everybody</h2>
        <p className="text-sm text-muted">Post this in Slack on the 1st. It lists the month’s birthdays and links to the board.</p>
        <label htmlFor="announce" className="sr-only">Announcement text</label>
        <textarea id="announce" className="input min-h-44" value={msg} onChange={(e) => { setMsg(e.target.value); setEdited(true); }} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(msg); toast("Copied. Paste it in #everybody."); } catch { toast("Select the text and copy it."); } }}>Copy message</button>
          {edited && <button type="button" className="link" onClick={() => setEdited(false)}>Reset to the default message</button>}
        </div>
      </section>
    </div>
  );
}
