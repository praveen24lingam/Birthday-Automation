"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { useBoard } from "@/components/providers";
import { Overview } from "@/components/team/Overview";
import { People } from "@/components/team/People";
import { Approvals } from "@/components/team/Approvals";
import { Settings } from "@/components/team/Settings";
import { PinModal } from "@/components/team/PinModal";
import { curMonth, monthName, nextMonth } from "@/lib/utils";

const TABS = [["overview", "This month"], ["people", "People"], ["approvals", "Photos to approve"], ["settings", "Settings"]] as const;

export default function TeamPage() {
  const { isTeam, viewMonth, setViewMonth, pending } = useBoard();
  const [tab, setTab] = useState<string>("overview");
  const [showPin, setShowPin] = useState(!isTeam);

  if (!isTeam) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl font-display">Birthday Team Access</h1>
        <p className="mt-3 text-muted">Enter the team PIN to manage birthdays, templates, and approvals.</p>
        <button
          type="button"
          onClick={() => setShowPin(true)}
          className="btn btn-primary mt-6"
        >
          Enter PIN to Unlock 🔒
        </button>
        <PinModal
          isOpen={showPin}
          onSuccess={() => setShowPin(false)}
          onCancel={() => setShowPin(false)}
        />
        <div className="mt-4">
          <Link href="/" className="text-xs text-muted underline">Back to the board</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-9">
      <h1 className="text-[clamp(2.2rem,5vw,3.3rem)]">Birthday team</h1>
      <p className="mt-1.5 max-w-[62ch] text-muted">Only the birthday team sees this page. Set up the month, add people, approve photos and post the announcement.</p>
      <div className="my-6 flex flex-wrap items-center gap-3">
        <label htmlFor="vm" className="font-bold">Working on</label>
        <select id="vm" className="input w-auto min-w-56" value={viewMonth} onChange={(e) => setViewMonth(e.target.value)}>
          <option value={curMonth()}>{monthName(curMonth())} (now)</option>
          <option value={nextMonth()}>{monthName(nextMonth())} (next)</option>
        </select>
        <span className="text-sm text-muted">{viewMonth === curMonth() ? "Everyone sees this month." : "Only the team sees this preview. It goes live for everyone on the 1st."}</span>
      </div>
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List aria-label="Birthday team tools" className="mb-7 flex flex-wrap gap-1 border-b-2 border-line pb-2.5">
          {TABS.map(([k, label]) => (
            <Tabs.Trigger key={k} value={k} className={`relative rounded-xl px-4 py-2 font-bold ${tab === k ? "text-accent-ink" : "text-muted hover:text-ink"}`}>
              {tab === k && <motion.span layoutId="team-tab" className="absolute inset-0 -z-10 rounded-xl bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              {label}{k === "approvals" && pending.length > 0 && <span className="ml-1.5 rounded-full bg-[var(--a2)] px-1.5 text-xs text-white">{pending.length}</span>}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="overview"><Overview /></Tabs.Content>
        <Tabs.Content value="people"><People /></Tabs.Content>
        <Tabs.Content value="approvals"><Approvals /></Tabs.Content>
        <Tabs.Content value="settings"><Settings /></Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
