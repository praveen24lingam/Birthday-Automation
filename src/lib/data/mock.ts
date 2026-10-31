"use client";
import type { AuthService, BoardRepo, Memory, Person, Role, Snapshot, Viewer, Wish } from "./types";
import { curMonth, newId, nextMonth, store } from "../utils";

/**
 * PREVIEW BACKEND
 * Keeps everything in this browser (localStorage) so the team can review
 * the design before Firebase is connected. Replace with ./firebase.ts later.
 */
const KEY = "bb-preview-v1";
const listeners = new Set<(s: Snapshot) => void>();

function seed(): Snapshot {
  const cm = curMonth(), nm = nextMonth();
  const mm = cm.split("-")[1], nmm = nm.split("-")[1];
  const today = String(new Date().getDate()).padStart(2, "0");
  const mk = (name: string, day: string, month: string, group: string, note: string): Person => ({ id: newId("p", name), name, bday: `${month}-${day}`, group, note, photo: "", createdAt: Date.now() });
  const people: Person[] = [
    mk("Ananya Deshpande", today, mm, "Pune campus", "The calm voice in every chaotic standup. Thank you for always making time for the newest student in the room."),
    mk("Rahul Verma", "03", mm, "Tech", "Ships fixes faster than we can report bugs. Chai expert, keyboard warrior."),
    mk("Imran Khan", "07", mm, "Admissions", "Has personally welcomed half of our students. Smile included, every single time."),
    mk("Meera Nair", "12", mm, "Finance", "Keeps every rupee honest and every deadline gentle."),
    mk("Kabir Singh", "18", mm, "Dharamshala campus", "Mountain mornings, debugging nights, and the best playlist on campus."),
    mk("Priya Sharma", "21", mm, "People & Culture", "The reason our onboarding feels like coming home."),
    mk("Tara Joshi", "25", mm, "Programs", ""),
    mk("Dev Patel", "28", mm, "Tech", "Our resident open-source evangelist."),
    mk("Lata Rao", "05", nmm, "Operations", "Makes the impossible look like a checklist."),
    mk("Ishaan Gupta", "14", nmm, "Partnerships", ""),
  ];
  const a = people[0], r = people[1];
  const wishes: Wish[] = [
    { id: newId("w"), from: "Neha", to: a.id, toName: a.name, text: "Happy birthday Ananya! Thank you for being the best mentor a batch could ask for 💛", createdAt: Date.now() - 3600e3, month: cm, uid: "demo1", pinned: true },
    { id: newId("w"), from: "Vikram", to: "all", toName: "", text: "Happy birthday to everyone born this month! Cake is on the October crew 🎂", createdAt: Date.now() - 7200e3, month: cm, uid: "demo2" },
    { id: newId("w"), from: "Sana", to: r.id, toName: r.name, text: "Another year of fixing prod at 2am. Have a great one, Rahul!", createdAt: Date.now() - 86400e3, month: cm, uid: "demo3" },
  ];
  const memories: Memory[] = [
    { id: newId("m"), from: "Ravi", about: a.id, aboutName: a.name, text: "The day the campus wifi died before demo day and Ananya ran the whole session from a phone hotspot without missing a beat.", createdAt: Date.now() - 5400e3, month: cm, uid: "demo4", photo: "", photoStatus: "" },
  ];
  return { people, wishes, memories, config: { title: "Birthday Board", subtitle: "Blow out the candles, flip the cards, leave a wish.", approvePhotos: true, templates: {} } };
}

function load(): Snapshot {
  const raw = store.get(KEY);
  if (raw) { try { return JSON.parse(raw) as Snapshot; } catch { /* reseed */ } }
  const s = seed(); store.set(KEY, JSON.stringify(s)); return s;
}
let state: Snapshot | null = null;
const get = () => (state ??= load());
function commit(next: Snapshot) {
  state = next;
  store.set(KEY, JSON.stringify(next));
  listeners.forEach((cb) => cb(next));
}
const wait = () => new Promise((r) => setTimeout(r, 120));

export const mockRepo: BoardRepo = {
  subscribe(cb) {
    listeners.add(cb);
    setTimeout(() => cb(get()), 0);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY && e.newValue) { state = JSON.parse(e.newValue); cb(state!); } };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
  },
  async addWish(w) { await wait(); const s = get(); commit({ ...s, wishes: [{ ...w, id: newId("w") }, ...s.wishes] }); },
  async updateWish(id, patch) { const s = get(); commit({ ...s, wishes: s.wishes.map((w) => (w.id === id ? { ...w, ...patch } : w)) }); },
  async deleteWish(id) { const s = get(); commit({ ...s, wishes: s.wishes.filter((w) => w.id !== id) }); },
  async addMemory(m) { await wait(); const s = get(); commit({ ...s, memories: [{ ...m, id: newId("m") }, ...s.memories] }); },
  async updateMemory(id, patch) { const s = get(); commit({ ...s, memories: s.memories.map((m) => (m.id === id ? { ...m, ...patch } : m)) }); },
  async deleteMemory(id) { const s = get(); commit({ ...s, memories: s.memories.filter((m) => m.id !== id) }); },
  async savePerson(p) { const s = get(); const exists = s.people.some((x) => x.id === p.id); commit({ ...s, people: exists ? s.people.map((x) => (x.id === p.id ? p : x)) : [...s.people, p] }); },
  async deletePerson(id) { const s = get(); commit({ ...s, people: s.people.filter((p) => p.id !== id) }); },
  async saveConfig(patch) { const s = get(); commit({ ...s, config: { ...s.config, ...patch } }); },
};

/* ---------------- preview sign-in ---------------- */
const AKEY = "bb-preview-viewer";
const authListeners = new Set<(v: Viewer | null) => void>();
let viewer: Viewer | null | undefined;
const readViewer = (): Viewer | null => { const raw = store.get(AKEY); try { return raw ? (JSON.parse(raw) as Viewer) : null; } catch { return null; } };
const setViewer = (v: Viewer | null) => { viewer = v; store.set(AKEY, v ? JSON.stringify(v) : ""); authListeners.forEach((cb) => cb(v)); };

export const mockAuth: AuthService = {
  current() { if (viewer === undefined) viewer = readViewer(); return viewer; },
  onChange(cb) { authListeners.add(cb); return () => authListeners.delete(cb); },
  async signInWithGoogle(previewRole: Role = "member") {
    await new Promise((r) => setTimeout(r, 500));
    setViewer(previewRole === "team"
      ? { uid: "preview-team", name: "Birthday Team Lead", email: "lead@navgurukul.org", role: "team" }
      : { uid: "preview-member", name: "A Colleague", email: "colleague@navgurukul.org", role: "member" });
  },
  async signOut() { setViewer(null); },
};

export function resetPreviewData() { store.set(KEY, ""); state = null; listeners.forEach((cb) => cb(get())); }
