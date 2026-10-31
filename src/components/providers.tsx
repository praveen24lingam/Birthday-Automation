"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { auth, repo } from "@/lib/data";
import type { BoardConfig, Memory, Person, Snapshot, TemplateKey, Viewer, Wish } from "@/lib/data/types";
import { TEMPLATES } from "@/lib/templates";
import { audio } from "@/lib/audio";
import { curMonth, monthOf, sortPeople } from "@/lib/utils";

type Board = {
  viewer: Viewer | null;
  authReady: boolean;
  isTeam: boolean;
  ready: boolean;
  snap: Snapshot;
  viewMonth: string;
  setViewMonth: (m: string) => void;
  tpl: TemplateKey;
  monthPeople: Person[];
  wishes: Wish[];
  memories: Memory[];
  pending: Memory[];
  findPerson: (id: string) => Person | undefined;
  canRemove: (item: { uid: string }) => boolean;
  repo: typeof repo;
  saveConfig: (patch: Partial<BoardConfig>) => Promise<void>;
  toast: (msg: string) => void;
};

const Ctx = createContext<Board | null>(null);
export const useBoard = () => { const c = useContext(Ctx); if (!c) throw new Error("useBoard outside provider"); return c; };

const EMPTY: Snapshot = { people: [], wishes: [], memories: [], config: {} };

export function Providers({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [ready, setReady] = useState(false);
  const [viewMonth, setViewMonth] = useState(curMonth());
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setViewer(auth.current()); setAuthReady(true); return auth.onChange(setViewer); }, []);
  useEffect(() => { if (!viewer) return; return repo.subscribe((s) => { setSnap(s); setReady(true); }); }, [viewer]);

  const isTeam = viewer?.role === "team";
  useEffect(() => { if (!isTeam) setViewMonth(curMonth()); }, [isTeam]);

  const tpl: TemplateKey = (() => { const t = snap.config.templates?.[viewMonth]; return t && TEMPLATES[t] ? t : "party"; })();
  useEffect(() => { document.documentElement.dataset.tpl = tpl; audio.setTemplate(tpl); }, [tpl]);

  const mm = viewMonth.split("-")[1];
  const monthPeople = useMemo(() => sortPeople(snap.people.filter((p) => p.bday?.slice(0, 2) === mm && !p.hidden)), [snap.people, mm]);
  const wishes = useMemo(() => snap.wishes.filter((w) => monthOf(w) === viewMonth).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt), [snap.wishes, viewMonth]);
  const memories = useMemo(() => snap.memories.filter((m) => monthOf(m) === viewMonth).sort((a, b) => b.createdAt - a.createdAt), [snap.memories, viewMonth]);
  const pending = useMemo(() => snap.memories.filter((m) => m.photo && m.photoStatus === "pending"), [snap.memories]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3400);
  }, []);

  const value: Board = {
    viewer, authReady, isTeam, ready, snap, viewMonth, setViewMonth, tpl, monthPeople, wishes, memories, pending,
    findPerson: (id) => snap.people.find((p) => p.id === id),
    canRemove: (item) => isTeam || (!!viewer && item.uid === viewer.uid),
    repo,
    saveConfig: (patch) => repo.saveConfig(patch),
    toast,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className={`toast ${toastMsg ? "on" : ""}`}>{toastMsg}</div>
    </Ctx.Provider>
  );
}
