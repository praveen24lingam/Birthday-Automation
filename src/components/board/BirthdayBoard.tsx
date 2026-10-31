"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useBoard } from "../providers";
import { FlipCard } from "../FlipCard";
import { FairyLights } from "./FairyLights";
import { Avatar } from "../ui/Avatar";
import { curMonth, monthOnly, todayKey, fmtBday } from "@/lib/utils";

type SortOption = "date" | "upcoming" | "name";

export function BirthdayBoard({ compact = false }: { compact?: boolean }) {
  const { monthPeople, wishes, viewMonth, ready } = useBoard();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [expanded, setExpanded] = useState(!compact);

  const tk = todayKey();
  const isNow = viewMonth === curMonth();
  const monthName = monthOnly(viewMonth);
  const todayDayNum = isNow ? parseInt(tk.split("-")[1] || "1", 10) : 1;

  // Campus / Team groups
  const groups = useMemo(() => {
    const map = new Map<string, number>();
    monthPeople.forEach((p) => {
      if (p.group) map.set(p.group, (map.get(p.group) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [monthPeople]);

  // Today's birthday stars for VIP spotlight
  const todayStars = useMemo(() => {
    if (!isNow) return [];
    return monthPeople.filter((p) => p.bday === tk);
  }, [monthPeople, isNow, tk]);

  // Available unique days with birthday counts for the Date Jumper
  const dayTimeline = useMemo(() => {
    const map = new Map<number, number>();
    monthPeople.forEach((p) => {
      if (p.bday) {
        const d = parseInt(p.bday.split("-")[1], 10);
        if (d) map.set(d, (map.get(d) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [monthPeople]);

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    let list = monthPeople;

    // Filter by campus/group
    if (tab !== "all") {
      list = list.filter((p) => p.group === tab);
    }

    // Filter by specific day if selected from timeline
    if (selectedDay !== null) {
      list = list.filter((p) => {
        if (!p.bday) return false;
        return parseInt(p.bday.split("-")[1], 10) === selectedDay;
      });
    }

    // Filter by live search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const groupMatch = p.group?.toLowerCase().includes(q);
        const noteMatch = p.note?.toLowerCase().includes(q);
        const dateMatch = p.bday ? fmtBday(p.bday, true).toLowerCase().includes(q) : false;
        const dayMatch = p.bday ? p.bday.split("-")[1].includes(q) : false;
        return nameMatch || groupMatch || noteMatch || dateMatch || dayMatch;
      });
    }

    // Sorting
    return list.slice().sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      const dayA = a.bday ? parseInt(a.bday.split("-")[1], 10) : 999;
      const dayB = b.bday ? parseInt(b.bday.split("-")[1], 10) : 999;

      if (sortBy === "upcoming") {
        // Birthdays from today forward come first, then birthdays earlier in the month
        const diffA = dayA >= todayDayNum ? dayA - todayDayNum : dayA + 32;
        const diffB = dayB >= todayDayNum ? dayB - todayDayNum : dayB + 32;
        if (diffA !== diffB) return diffA - diffB;
        return a.name.localeCompare(b.name);
      }

      // Default: "date" (1st to 31st)
      if (dayA !== dayB) return dayA - dayB;
      return a.name.localeCompare(b.name);
    });
  }, [monthPeople, tab, selectedDay, search, sortBy, todayDayNum]);

  // Scaled view limit (show 15 cards initially if not expanded, perfect for 30+ person scale)
  const displayLimit = 15;
  const visibleList = expanded ? filteredList : filteredList.slice(0, displayLimit);
  const hasMore = filteredList.length > displayLimit && !expanded;

  const resetFilters = () => {
    setTab("all");
    setSearch("");
    setSelectedDay(null);
    setSortBy("date");
  };

  const isFiltered = tab !== "all" || selectedDay !== null || Boolean(search.trim());

  return (
    <section
      id="birthday-board"
      aria-labelledby="board-heading"
      className="relative mx-auto max-w-6xl px-3 py-8 sm:px-6"
    >
      {/* Outer Wooden / Cork Board Frame */}
      <div className="relative rounded-[32px] border-4 border-amber-950/20 bg-gradient-to-b from-[#2d1b11]/10 via-amber-950/5 to-amber-900/15 p-2 sm:p-4 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xs">
        
        {/* Fairy lights hanging on top of the board */}
        <FairyLights count={16} />

        {/* Board Surface */}
        <div className="relative overflow-hidden rounded-[26px] border border-amber-950/20 bg-surface/95 px-4 py-8 shadow-[inset_0_3px_20px_rgba(0,0,0,0.08)] sm:px-8 sm:py-10">
          
          {/* Subtle cork / pinboard dot texture in background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1.5px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          {/* Board Header Plaque */}
          <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4 border-b-2 border-line/70 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-xl shadow-xs ring-1 ring-amber-400/30">
                  📌
                </span>
                <h2 id="board-heading" className="font-display text-3xl sm:text-4xl tracking-tight text-ink">
                  {monthName} Birthday Board
                </h2>
              </div>
              <p className="mt-1.5 text-sm text-muted">
                {monthPeople.length > 0
                  ? `Celebrating ${monthPeople.length} amazing stars this month! Tap any polaroid to flip or celebrate.`
                  : "Celebrating NavGurukul team & campus stars."}
              </p>
            </div>

            {/* Right side quick action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-3.5 py-1.5 text-xs font-bold text-ink">
                ⭐ {filteredList.length} {filteredList.length === 1 ? "Star" : "Stars"}
              </span>
              <Link
                href="/wishes/"
                className="btn btn-sm border-line hover:border-amber-400 bg-raised text-xs font-semibold"
              >
                Write a wish 💌
              </Link>
            </div>
          </div>

          {/* TODAY'S BIRTHDAY VIP SPOTLIGHT (Ensures today's stars are immediately highlighted among 30+ people) */}
          {todayStars.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-10 mb-8 overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-4 sm:p-5 shadow-[0_8px_24px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <span className="absolute -top-2 -left-2 z-10 text-xl animate-bounce">👑</span>
                    <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-400/25 ring-2 ring-amber-400 shadow-md overflow-hidden">
                      <Avatar person={todayStars[0]} className="h-full w-full text-xl sm:text-2xl" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-950 shadow-xs">
                        Today&apos;s Birthday VIP
                      </span>
                      <span className="text-xs text-amber-500 font-semibold animate-pulse">🎉 Make a wish!</span>
                    </div>
                    <h3 className="mt-1 font-display text-lg sm:text-xl text-ink font-bold">
                      {todayStars.map((p) => p.name).join(", ")}
                    </h3>
                    <p className="text-xs text-muted">
                      {todayStars.map((p) => p.group).filter(Boolean).join(" • ") || "NavGurukul Star"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {todayStars.map((p) => (
                    <Link
                      key={p.id}
                      href={`/celebrate/?id=${encodeURIComponent(p.id)}`}
                      className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-neutral-950 shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5"
                    >
                      <span>Celebrate {todayStars.length > 1 ? p.name.split(" ")[0] : "Now"}</span>
                      <span>✨</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SEARCH & CONTROLS TOOLBAR (Crucial when scaling to 30+ birthdays) */}
          <div className="relative z-10 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Live Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, campus, or day..."
                className="w-full rounded-full border border-line bg-raised/90 py-2 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-muted/70 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-2">
              <label htmlFor="board-sort" className="text-xs font-semibold text-muted flex-none">
                Sort:
              </label>
              <select
                id="board-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-line bg-raised/90 px-3 py-1.5 text-xs font-semibold text-ink focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="date">📅 Date (1st → 31st)</option>
                <option value="upcoming">⏰ Upcoming First</option>
                <option value="name">🔤 Name (A → Z)</option>
              </select>

              {/* Reset filter badge */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Reset ✕
                </button>
              )}
            </div>
          </div>

          {/* CAMPUS & TEAM FILTER TABS */}
          {groups.length > 0 && (
            <div
              className="relative z-10 mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none"
              role="group"
              aria-label="Filter board by campus or team"
            >
              <button
                type="button"
                aria-pressed={tab === "all"}
                onClick={() => setTab("all")}
                className={`relative flex-none rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  tab === "all"
                    ? "bg-accent text-accent-ink shadow-sm"
                    : "border border-line bg-raised/80 text-muted hover:text-ink hover:border-amber-400"
                }`}
              >
                All Stars ({monthPeople.length})
              </button>

              {groups.map(([groupName, count]) => {
                const active = tab === groupName;
                return (
                  <button
                    key={groupName}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTab(groupName)}
                    className={`relative flex-none rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-accent text-accent-ink shadow-sm"
                        : "border border-line bg-raised/80 text-muted hover:text-ink hover:border-amber-400"
                    }`}
                  >
                    {groupName} <span className="opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* INTERACTIVE DATE JUMPER TIMELINE (When multiple birthdays exist) */}
          {dayTimeline.length > 3 && (
            <div className="relative z-10 mb-8 rounded-2xl border border-line/60 bg-raised/40 p-2.5 backdrop-blur-xs">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <span>🗓️</span>
                  <span>Date Jumper ({dayTimeline.length} Days)</span>
                </span>
                {selectedDay !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-[11px] font-bold text-accent hover:underline"
                  >
                    Show All Days
                  </button>
                )}
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className={`flex-none rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    selectedDay === null
                      ? "bg-amber-400 text-neutral-950 shadow-xs"
                      : "border border-line bg-surface/80 text-muted hover:text-ink"
                  }`}
                >
                  All
                </button>
                {dayTimeline.map(([day, count]) => {
                  const isSelected = selectedDay === day;
                  const isToday = isNow && day === todayDayNum;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`flex-none rounded-lg px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-amber-400 text-neutral-950 font-bold shadow-xs"
                          : isToday
                          ? "border-2 border-amber-400 bg-amber-400/20 text-ink font-bold"
                          : "border border-line bg-surface/80 text-muted hover:text-ink"
                      }`}
                    >
                      <span>{String(day).padStart(2, "0")}</span>
                      {count > 1 && (
                        <span className="rounded-full bg-black/10 dark:bg-white/15 px-1 text-[10px] font-bold">
                          {count}
                        </span>
                      )}
                      {isToday && <span>⭐</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* THE BOARD GRID */}
          {!ready ? (
            <div
              className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              aria-busy="true"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl border-2 border-line/60 bg-raised/50 p-3 shadow-sm animate-pulse flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-xl bg-line/40" />
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-3/4 rounded bg-line/60" />
                    <div className="h-3 w-1/2 rounded bg-line/30" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="relative z-10 rounded-2xl border-2 border-dashed border-line p-12 text-center">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-3 text-xl font-bold text-ink">
                {search ? `No stars found for "${search}"` : "No birthdays match this filter"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                Try clearing your search query or choosing another campus tab.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-sm btn-primary mt-4 inline-block"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <motion.ul
                layout
                className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                <AnimatePresence mode="popLayout">
                  {visibleList.map((p, i) => (
                    <FlipCard
                      key={p.id}
                      p={p}
                      index={i}
                      today={isNow && p.bday === tk}
                      wishCount={wishes.filter((w) => w.to === p.id).length}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>

              {/* EXPAND / SHOW MORE BUTTON (For clean UX when 30+ people are in one month) */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="group relative rounded-full border-2 border-amber-400/60 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 px-6 py-2.5 text-sm font-bold text-ink shadow-md hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <span>Show all {filteredList.length} stars ({filteredList.length - displayLimit} more)</span>
                    <span className="ml-2 inline-block transition-transform group-hover:translate-y-0.5">↓</span>
                  </button>
                </div>
              )}

              {expanded && filteredList.length > displayLimit && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="rounded-full border border-line bg-raised/80 px-5 py-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
                  >
                    Show less ↑
                  </button>
                </div>
              )}
            </>
          )}

          {/* BOTTOM BOARD FOOTER NOTE */}
          <div className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span>💡</span>
              <span>Tap any card to flip and read their personal note, or click Celebrate ✨</span>
            </span>
            <span className="font-semibold text-accent">
              NavGurukul People &amp; Culture Board 💛
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
