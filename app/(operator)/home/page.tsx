"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/session";
import { getSectionById } from "@/app/actions/data";
import type { OperatorSession, Section } from "@/lib/types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }
    setSession(s);
    getSectionById(s.sectionId).then((data) => setSection(data));
  }, [router]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6 px-5 py-8">
      <div>
        <p className="text-sm text-slate-400">{getGreeting()}</p>
        <h1 className="mt-0.5 text-2xl font-bold text-white">{session.name}</h1>
        {section && (
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: section.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {section.name}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <Link
          href="/job-log"
          className="flex min-h-16 items-center gap-4 rounded-xl bg-slate-800 px-5 active:bg-slate-700"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-xl text-blue-400">⏱</span>
          <div>
            <p className="font-semibold text-white">Job Log</p>
            <p className="text-xs text-slate-400">Start or view active work orders</p>
          </div>
          <span className="ml-auto text-slate-500">›</span>
        </Link>

        <Link
          href="/tasks"
          className="flex min-h-16 items-center gap-4 rounded-xl bg-slate-800 px-5 active:bg-slate-700"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-xl text-emerald-400">✓</span>
          <div>
            <p className="font-semibold text-white">My Tasks</p>
            <p className="text-xs text-slate-400">Section checklists for today</p>
          </div>
          <span className="ml-auto text-slate-500">›</span>
        </Link>

        <Link
          href="/history"
          className="flex min-h-16 items-center gap-4 rounded-xl bg-slate-800 px-5 active:bg-slate-700"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-xl text-slate-300">↺</span>
          <div>
            <p className="font-semibold text-white">History</p>
            <p className="text-xs text-slate-400">Your recent completed jobs</p>
          </div>
          <span className="ml-auto text-slate-500">›</span>
        </Link>
      </div>

      <button
        onClick={() => { clearSession(); router.replace("/"); }}
        className="mt-2 px-2 py-3 text-sm text-slate-500 active:text-slate-300"
      >
        Sign out
      </button>
    </div>
  );
}
