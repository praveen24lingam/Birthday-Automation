export type TemplateKey = "party" | "mehfil" | "pinboard" | "starlight" | "pop";

export type Person = {
  id: string;
  name: string;
  /** "MM-DD", the year is never stored */
  bday: string;
  group?: string;
  note?: string;
  /** compressed JPEG data URL (Firestore-friendly, no Cloud Storage needed) */
  photo?: string;
  hidden?: boolean;
  createdAt: number;
};

export type Wish = {
  id: string;
  from: string;
  /** person id or "all" */
  to: string;
  toName: string;
  text: string;
  createdAt: number;
  /** "YYYY-MM" the wish belongs to; used for the monthly clean-up */
  month: string;
  uid: string;
  pinned?: boolean;
};

export type PhotoStatus = "" | "pending" | "approved" | "rejected";

export type Memory = {
  id: string;
  from: string;
  about: string;
  aboutName: string;
  text: string;
  createdAt: number;
  month: string;
  uid: string;
  photo?: string;
  photoStatus?: PhotoStatus;
};

export type BoardConfig = {
  title?: string;
  subtitle?: string;
  approvePhotos?: boolean;
  /** template per month, e.g. { "2026-11": "mehfil" } */
  templates?: Record<string, TemplateKey>;
  lastCleanMonth?: string;
};

export type Snapshot = {
  people: Person[];
  wishes: Wish[];
  memories: Memory[];
  config: BoardConfig;
};

export type Role = "member" | "team";

export type Viewer = {
  uid: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * Everything the UI needs from a backend. The preview uses the mock
 * implementation; production swaps in Firebase without touching the UI.
 */
export interface BoardRepo {
  subscribe(cb: (s: Snapshot) => void): () => void;
  addWish(w: Omit<Wish, "id">): Promise<void>;
  updateWish(id: string, patch: Partial<Wish>): Promise<void>;
  deleteWish(id: string): Promise<void>;
  addMemory(m: Omit<Memory, "id">): Promise<void>;
  updateMemory(id: string, patch: Partial<Memory>): Promise<void>;
  deleteMemory(id: string): Promise<void>;
  savePerson(p: Person): Promise<void>;
  deletePerson(id: string): Promise<void>;
  saveConfig(patch: Partial<BoardConfig>): Promise<void>;
}

export interface AuthService {
  current(): Viewer | null;
  onChange(cb: (v: Viewer | null) => void): () => void;
  signInWithGoogle(previewRole?: Role): Promise<void>;
  signOut(): Promise<void>;
}
