"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { verifyAdminPin } from "@/lib/data/firebase";

export function PinModal({
  isOpen,
  onSuccess,
  onCancel,
}: {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pin)) {
      setErr(false);
      onSuccess();
    } else {
      setErr(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-white/20 bg-[#1e1338] p-7 text-center shadow-2xl text-white"
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 text-3xl">
          🔒
        </div>
        <h2 className="font-display text-2xl text-amber-200">Birthday Team Access</h2>
        <p className="mt-1 text-sm text-neutral-300">
          Enter the secret team PIN to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            autoFocus
            maxLength={10}
            value={pin}
            onChange={(e) => {
              setErr(false);
              setPin(e.target.value);
            }}
            placeholder="Enter PIN (e.g. 1947)"
            className="w-full rounded-2xl border-2 border-amber-300/40 bg-black/40 px-4 py-3 text-center font-mono text-2xl tracking-widest text-amber-200 outline-none focus:border-amber-400"
          />

          {err && (
            <p className="text-xs font-semibold text-rose-400">
              Incorrect PIN. Please try again.
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border border-white/20 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 text-sm font-bold text-neutral-900 shadow-md hover:scale-105 active:scale-95"
            >
              Unlock
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

