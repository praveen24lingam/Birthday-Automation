"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { auth, IS_PREVIEW } from "@/lib/data";
import type { Role } from "@/lib/data/types";
import { Cake } from "./hero/Cake";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function LoginScreen() {
  const [busy, setBusy] = useState<Role | null>(null);
  const go = async (role: Role) => { setBusy(role); try { await auth.signInWithGoogle(role); } finally { setBusy(null); } };
  return (
    <main className="hero grid min-h-[100svh] place-items-center px-5 py-16 text-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full max-w-md">
        <div className="mx-auto w-48"><Cake /></div>
        <h1 className="mt-4 text-5xl">Birthday Board</h1>
        <p className="mt-3 text-lg" style={{ color: "var(--hero-muted)" }}>Sign in with your NavGurukul Google account to see this month’s birthdays and leave a wish.</p>
        <button type="button" onClick={() => go("member")} disabled={!!busy}
          className="mx-auto mt-8 flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 font-semibold text-[#1f1f1f] shadow-lg transition hover:shadow-xl active:scale-[.98] disabled:opacity-60">
          <GoogleMark /> {busy === "member" ? "Signing in…" : "Continue with Google"}
        </button>
        <p className="mt-3 text-sm" style={{ color: "var(--hero-muted)" }}>Only @navgurukul.org accounts can sign in.</p>
        {IS_PREVIEW && (
          <div className="mt-10 rounded-2xl border border-dashed border-current/40 p-4 text-sm" style={{ color: "var(--hero-muted)" }}>
            <p><b>Design preview.</b> Google sign-in is connected in the next phase. To review the birthday team’s dashboard, sign in as the team instead.</p>
            <button type="button" onClick={() => go("team")} disabled={!!busy} className="link mt-2 font-semibold" style={{ fontSize: ".95rem" }}>
              {busy === "team" ? "Signing in…" : "Sign in as birthday team"}
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
