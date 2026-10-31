"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useBoard } from "./providers";
import { MusicToggle } from "./ui/MusicToggle";
import { auth } from "@/lib/data";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/wall/", label: "Birthday Board 📌" },
  { href: "/wishes/", label: "Wishes 💌" },
  { href: "/memories/", label: "Memories 🎞️" },
];

export function SiteHeader() {
  const path = usePathname() || "/";
  const { isTeam, viewer, snap, pending } = useBoard();
  const links = isTeam ? [...LINKS, { href: "/team/", label: "Birthday team" }] : LINKS;
  const norm = (p: string) => (p.endsWith("/") ? p : p + "/");
  const title = snap.config.title?.trim() || "Birthday Board";
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--a1)] backdrop-blur-xl" style={{ background: "var(--nav-bg)", color: "var(--nav-ink)", paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-xl text-white no-underline font-display group">
          <svg viewBox="0 0 32 32" className="h-8 w-8 flex-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" aria-hidden><rect x="5" y="17" width="22" height="11" rx="3" fill="#ff5d86" /><rect x="8" y="12" width="16" height="6" rx="2" fill="#fff3d6" /><rect x="15" y="5" width="2.5" height="7" fill="#fff" /><path d="M16.2.8c2 2.2 2 3.8 0 4.6c-2-.8-2-2.4 0-4.6z" fill="#ffb020" /></svg>
          <span className="truncate group-hover:text-amber-300 transition-colors">{title}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:order-3">
          <MusicToggle />
          {isTeam && (
            <button
              type="button"
              onClick={() => auth.signOut()}
              className="rounded-full border border-amber-300/40 bg-black/30 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-black/50 transition"
              title="Lock team dashboard"
            >
              Lock Admin 🔒
            </button>
          )}
        </div>
        <nav aria-label="Board sections" className="order-last -mx-1 flex w-full gap-1 overflow-x-auto pb-1 sm:order-2 sm:ml-4 sm:w-auto sm:pb-0">
          {links.map((l) => {
            const active = norm(path) === l.href;
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-[.95rem] font-semibold no-underline transition-colors ${active ? "text-[#1a1033]" : "text-white/85 hover:text-white"} ${l.href === "/team/" && !active ? "border border-dashed border-[var(--a1)]/70" : ""}`}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-[var(--a1)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {l.label}
                {l.href === "/team/" && pending.length > 0 && <span className="ml-1.5 rounded-full bg-[var(--a2)] px-1.5 text-xs text-white">{pending.length}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
