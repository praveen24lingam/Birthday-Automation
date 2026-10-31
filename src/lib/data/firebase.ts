"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import type { AuthService, BoardRepo, Memory, Person, Snapshot, Viewer, Wish } from "./types";
import { newId, store } from "../utils";

// Firebase Config from Environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBd51BrgsxaYCh_GnQx_5qw4iOGUEKhK7c",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "birthday-automation-bdcf2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "birthday-automation-bdcf2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "birthday-automation-bdcf2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "136624744113",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:136624744113:web:21caf90f3ff8bcb228e490",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4B44X0KDR0",
};

// Initialize Firebase App & Firestore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Local cache for snapshot
let currentSnapshot: Snapshot = {
  people: [],
  wishes: [],
  memories: [],
  config: { title: "Birthday Board", subtitle: "Blow out the candles, flip the cards, leave a wish.", approvePhotos: true, templates: {} },
};

export const firebaseRepo: BoardRepo = {
  subscribe(cb) {
    const unsubPeople = onSnapshot(collection(db, "people"), (snap) => {
      currentSnapshot.people = snap.docs.map((d) => d.data() as Person);
      cb({ ...currentSnapshot });
    }, (err) => console.warn("Firestore people error:", err));

    const unsubWishes = onSnapshot(collection(db, "wishes"), (snap) => {
      currentSnapshot.wishes = snap.docs.map((d) => d.data() as Wish);
      cb({ ...currentSnapshot });
    }, (err) => console.warn("Firestore wishes error:", err));

    const unsubMemories = onSnapshot(collection(db, "memories"), (snap) => {
      currentSnapshot.memories = snap.docs.map((d) => d.data() as Memory);
      cb({ ...currentSnapshot });
    }, (err) => console.warn("Firestore memories error:", err));

    const unsubConfig = onSnapshot(doc(db, "settings", "board"), (snap) => {
      if (snap.exists()) {
        currentSnapshot.config = snap.data();
      }
      cb({ ...currentSnapshot });
    }, (err) => console.warn("Firestore config error:", err));

    return () => {
      unsubPeople();
      unsubWishes();
      unsubMemories();
      unsubConfig();
    };
  },

  async addWish(w) {
    const id = newId("w");
    const item: Wish = { ...w, id };
    await setDoc(doc(db, "wishes", id), item);
  },

  async updateWish(id, patch) {
    await updateDoc(doc(db, "wishes", id), patch as any);
  },

  async deleteWish(id) {
    await deleteDoc(doc(db, "wishes", id));
  },

  async addMemory(m) {
    const id = newId("m");
    const item: Memory = { ...m, id };
    await setDoc(doc(db, "memories", id), item);
  },

  async updateMemory(id, patch) {
    await updateDoc(doc(db, "memories", id), patch as any);
  },

  async deleteMemory(id) {
    await deleteDoc(doc(db, "memories", id));
  },

  async savePerson(p) {
    await setDoc(doc(db, "people", p.id), p);
  },

  async deletePerson(id) {
    await deleteDoc(doc(db, "people", id));
  },

  async saveConfig(patch) {
    await setDoc(doc(db, "settings", "board"), patch, { merge: true });
  },
};

/* ---------------- PIN-based Admin Auth (No public login screen needed!) ---------------- */
const PIN_KEY = "bb_admin_pin";
const DEFAULT_PIN = "1947"; // Default admin PIN, configurable in settings

export const getAdminPin = (): string => store.get(PIN_KEY) || DEFAULT_PIN;
export const setAdminPin = (newPin: string): void => store.set(PIN_KEY, newPin);

// Check if current browser session has verified the PIN
const SESSION_AUTH_KEY = "bb_admin_authenticated";
const authListeners = new Set<(v: Viewer | null) => void>();

function getSessionViewer(): Viewer {
  const isTeam = typeof window !== "undefined" && sessionStorage.getItem(SESSION_AUTH_KEY) === "true";
  return {
    uid: isTeam ? "admin-team" : "guest-user",
    name: isTeam ? "Birthday Team Lead" : "Colleague",
    email: isTeam ? "team@navgurukul.org" : "colleague@navgurukul.org",
    role: isTeam ? "team" : "member",
  };
}

let currentViewer: Viewer = getSessionViewer();

export const pinAuth: AuthService = {
  current() {
    return currentViewer;
  },
  onChange(cb) {
    authListeners.add(cb);
    return () => authListeners.delete(cb);
  },
  async signInWithGoogle() {
    // Kept for interface compatibility
  },
  async signOut() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
    currentViewer = {
      uid: "guest-user",
      name: "Colleague",
      email: "colleague@navgurukul.org",
      role: "member",
    };
    authListeners.forEach((cb) => cb(currentViewer));
  },
};

export function verifyAdminPin(enteredPin: string): boolean {
  const correct = getAdminPin();
  if (enteredPin.trim() === correct.trim()) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_AUTH_KEY, "true");
    }
    currentViewer = {
      uid: "admin-team",
      name: "Birthday Team Lead",
      email: "team@navgurukul.org",
      role: "team",
    };
    authListeners.forEach((cb) => cb(currentViewer));
    return true;
  }
  return false;
}
