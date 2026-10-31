"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useBoard } from "@/components/providers";
import { CelebrateView } from "@/components/celebrate/CelebrateView";
import { todayKey } from "@/lib/utils";
import type { Person } from "@/lib/data/types";

function CelebrateClient() {
  const searchParams = useSearchParams();
  const { snap, monthPeople, findPerson, wishes, memories, tpl } = useBoard();

  const id = searchParams.get("id");
  const tk = todayKey();

  const { celebrants, isGroup } = useMemo(() => {
    // Group mode: ?id=all or ?all=1 or multiple birthdays today
    if (id === "all" || searchParams.get("all") === "1") {
      const todays = monthPeople.filter((p) => p.bday === tk);
      const groupList = todays.length > 0 ? todays : monthPeople.slice(0, 4);
      return { celebrants: groupList.length ? groupList : snap.people.slice(0, 2), isGroup: true };
    }

    // Specific person mode: ?id=<personId>
    if (id) {
      const match = findPerson(id) || snap.people.find((p) => p.id === id);
      if (match) {
        return { celebrants: [match], isGroup: false };
      }
    }

    // Default: Check if anyone has birthday today, else pick first month celebrant
    const todays = monthPeople.filter((p) => p.bday === tk);
    if (todays.length > 1) {
      return { celebrants: todays, isGroup: true };
    }
    if (todays.length === 1) {
      return { celebrants: [todays[0]], isGroup: false };
    }

    const fallback = monthPeople[0] || snap.people[0] || ({
      id: "sample",
      name: "Birthday Star",
      bday: "01-01",
      group: "NavGurukul",
      note: "Wishing you an extraordinary year filled with joy and growth!",
      createdAt: Date.now(),
    } as Person);

    return { celebrants: [fallback], isGroup: false };
  }, [id, searchParams, snap.people, monthPeople, findPerson, tk]);

  return (
    <CelebrateView
      celebrants={celebrants}
      isGroup={isGroup}
      tpl={tpl}
      wishes={wishes}
      memories={memories}
    />
  );
}

export default function CelebratePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] w-full items-center justify-center bg-[#120a21] text-amber-200">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="font-display text-lg">Lighting the celebration...</p>
          </div>
        </div>
      }
    >
      <CelebrateClient />
    </Suspense>
  );
}
