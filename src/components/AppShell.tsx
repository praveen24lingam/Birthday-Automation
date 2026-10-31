"use client";
import { usePathname } from "next/navigation";
import { useBoard } from "./providers";
import { LoginScreen } from "./LoginScreen";
import { SiteHeader } from "./SiteHeader";
import { AmbientCelebration } from "./ui/AmbientCelebration";
import { auth, IS_PREVIEW } from "@/lib/data";
import { resetPreviewData } from "@/lib/data/mock";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { authReady, viewer, isTeam } = useBoard();
  const pathname = usePathname();
  const isCelebrate = pathname?.startsWith("/celebrate");

  if (!authReady) {
    return (
      <div className="flex min-h-[100svh] w-full flex-col items-center justify-center bg-[#120a21] text-amber-200" aria-busy="true">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
            <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
          </div>
          <p className="font-display text-xl tracking-wide text-amber-100">NavGurukul Birthday Board</p>
          <span className="text-xs text-amber-200/60 font-mono">Lighting the candles...</span>
        </div>
      </div>
    );
  }
  if (!viewer) return <LoginScreen />;

  if (isCelebrate) {
    return <main className="relative min-h-[100svh] overflow-x-hidden bg-[#120a21] text-white">{children}</main>;
  }

  return (
    <>
      <AmbientCelebration />
      <SiteHeader />
      <main className="relative z-10">{children}</main>
      <footer className="mx-auto max-w-6xl px-5 pb-10 pt-6 text-sm text-muted">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t-2 border-line pt-5">
          <span>Made with love by People &amp; Culture, NavGurukul</span>
          <a href="/team/" className="text-xs text-muted hover:text-ink transition no-underline">
            Birthday Team Admin 🔒
          </a>
        </div>
      </footer>
    </>
  );
}
