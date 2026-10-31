"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Hero } from "@/components/hero/Hero";
import { BirthdayBoard } from "@/components/board/BirthdayBoard";
import { useBoard } from "@/components/providers";
import { Avatar } from "@/components/ui/Avatar";
import { curMonth, firstName, fmtBday, monthOnly, todayKey } from "@/lib/utils";

const rise = { hidden: { opacity: 0, y: 26 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: "spring" as const, stiffness: 160, damping: 18 } }) };

export default function Home() {
  const { monthPeople, wishes, memories, viewMonth } = useBoard();
  const isNow = viewMonth === curMonth();
  const tk = todayKey();
  const todays = isNow ? monthPeople.filter((p) => p.bday === tk) : [];
  const w = wishes[0], m = memories[0];
  const names = todays.map((p) => firstName(p.name));
  const todayLine = names.length === 1 ? `It’s ${names[0]}’s birthday today!` : names.length ? `Today is ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}’s birthday!` : "";
  const upcoming = isNow
    ? monthPeople.filter((p) => p.bday >= tk).sort((a, b) => a.bday.localeCompare(b.bday))
    : monthPeople;
  const nextStar = upcoming[0] || monthPeople[0];

  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 pb-16">
        {todays.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200, damping: 18 }}
            className="relative z-10 mx-auto -mt-9 mb-8 flex max-w-3xl flex-wrap items-center gap-4 rounded-3xl border-2 border-amber-400/80 bg-gradient-to-r from-raised via-raised to-amber-50/50 px-6 py-5 anim-pulse-glow backdrop-blur-sm"
          >
            <div className="flex">
              {todays.slice(0, 4).map((p, i) => (
                <Avatar
                  key={p.id}
                  person={p}
                  className="h-16 w-16 rounded-full border-[3px] border-amber-300 ring-4 ring-amber-400/20 text-xl shadow-md"
                  style={{ marginLeft: i ? -14 : 0 }}
                />
              ))}
            </div>
            <p className="flex-1 font-semibold text-lg text-ink">
              {todayLine}
              <span className="block font-normal text-sm text-muted mt-0.5">
                Send them some love on the wish wall or experience their cinematic birthday story!
              </span>
            </p>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {todays.length > 1 ? (
                <>
                  <Link
                    href="/celebrate/?id=all"
                    className="btn bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-md hover:scale-105 transition"
                  >
                    Celebrate everyone ✨
                  </Link>
                  <Link href="/wishes/" className="btn btn-primary">Write a wish</Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/celebrate/?id=${encodeURIComponent(todays[0].id)}`}
                    className="btn bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-md hover:scale-105 transition"
                  >
                    Celebrate {firstName(todays[0].name)} ✨
                  </Link>
                  <Link href="/wishes/" className="btn btn-primary">Write a wish</Link>
                </>
              )}
            </div>
          </motion.div>
        ) : monthPeople.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 mx-auto -mt-6 mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-gradient-to-r from-surface via-raised to-amber-500/10 px-6 py-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/20 text-xl">🎉</span>
              <div>
                <p className="font-semibold text-ink">
                  {nextStar ? (
                    <>Next birthday star: <span className="font-bold text-accent">{nextStar.name}</span> on {fmtBday(nextStar.bday, true)}</>
                  ) : (
                    <>Celebrating all {monthPeople.length} amazing stars this {monthOnly(viewMonth)}!</>
                  )}
                </p>
                <span className="text-xs text-muted">Send an early wish or experience their birthday stage.</span>
              </div>
            </div>
            {nextStar && (
              <Link
                href={`/celebrate/?id=${encodeURIComponent(nextStar.id)}`}
                className="btn text-xs font-bold border-amber-400/60 bg-amber-400/15 text-ink hover:bg-amber-400 hover:text-neutral-950 transition"
              >
                Celebrate {firstName(nextStar.name)} ✨
              </Link>
            )}
          </motion.div>
        ) : <div className="h-4" />}

        {/* -------------------------------------------------------------
            THE MAIN FOCUS: BIRTHDAY BOARD WITH PINNED POLAROID CARDS
            ------------------------------------------------------------- */}
        <BirthdayBoard />

        {/* Community Wishes & Memories Showcase */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Wish Wall Card */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Link
              href="/wishes/"
              className="panel panel-card card-shine group flex h-full min-h-[220px] flex-col justify-between p-6 text-inherit no-underline border-2 border-line hover:border-amber-400 hover:shadow-[0_16px_36px_rgba(255,180,40,0.22)] rounded-3xl"
            >
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[1.8rem] font-display transition-colors group-hover:text-accent">Wish Wall 💌</h3>
                  <span className="font-display text-3xl text-accent transition-transform duration-300 group-hover:scale-110">{wishes.length}</span>
                </div>
                {w ? (
                  <div className="hand relative mt-3 -rotate-1 rounded-[4px_16px_16px_16px] p-4 font-hand shadow-sm anim-float" style={{ background: "var(--note1)", color: "var(--note-ink)" }}>
                    <span className="absolute -top-2 left-6 block h-3 w-8 rounded-sm bg-amber-400/50 -rotate-3" />
                    {w.text.length > 130 ? w.text.slice(0, 127) + "…" : w.text}
                    <span className="mt-1.5 block font-body text-xs font-semibold opacity-75">{w.from}{w.to !== "all" ? `, for ${w.toName}` : ""}</span>
                  </div>
                ) : (
                  <p className="mt-3 text-muted leading-relaxed">No wishes yet. Yours can be the first to brighten someone’s special day!</p>
                )}
              </div>
              <span className="mt-4 font-bold text-accent flex items-center gap-1 group-hover:translate-x-2 transition-transform duration-300">
                <span>Write a wish for someone</span>
                <span>→</span>
              </span>
            </Link>
          </motion.div>

          {/* Memories Card */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Link
              href="/memories/"
              className="panel panel-card card-shine group flex h-full min-h-[220px] flex-col justify-between p-6 text-inherit no-underline border-2 border-line hover:border-amber-400 hover:shadow-[0_16px_36px_rgba(255,180,40,0.22)] rounded-3xl"
            >
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[1.8rem] font-display transition-colors group-hover:text-accent">Special Memories 🎞️</h3>
                  <span className="font-display text-3xl text-accent transition-transform duration-300 group-hover:scale-110">{memories.length}</span>
                </div>
                {m ? (
                  <div className="hand relative mt-3 rotate-1 rounded-[4px_16px_16px_16px] p-4 font-hand shadow-sm transition-transform duration-300 group-hover:rotate-2 group-hover:scale-[1.02]" style={{ background: "var(--note3)", color: "var(--note-ink)" }}>
                    <span className="absolute -top-2 left-6 block h-3 w-8 rounded-sm bg-rose-400/50 rotate-3" />
                    {m.text.length > 130 ? m.text.slice(0, 127) + "…" : m.text}
                    <span className="mt-1.5 block font-body text-xs font-semibold opacity-75">About {m.aboutName}</span>
                  </div>
                ) : (
                  <p className="mt-3 text-muted leading-relaxed">Share an old photo, funny story, or memorable campus moment.</p>
                )}
              </div>
              <span className="mt-4 font-bold text-accent flex items-center gap-1 group-hover:translate-x-2 transition-transform duration-300">
                <span>Explore campus memories</span>
                <span>→</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}

