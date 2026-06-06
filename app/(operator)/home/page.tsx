"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { OperatorSession, Section } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }
    setSession(s);

    supabase
      .from("sections")
      .select("*")
      .eq("id", s.sectionId)
      .single()
      .then(({ data }) => setSection(data));
  }, [router]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6 px-5 py-8">
      {/* Greeting */}
      <div>
        <p className="text-sm text-slate-400">Good day,</p>
        <h1 className="mt-0.5 text-2xl font-bold text-white">{session.name}</h1>
        {section && (
          <span
            className="mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: section.color }}
          >
            {section.name}
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <Link
          href="/job-log"
          className="flex min-h-16 items-center gap-4 rounded-xl bg-slate-800 px-5 active:bg-slate-700"
        >
          <span className="text-2xl">⏱</span>
          <div>
            <p className="font-semibold text-white">Job Log</p>
            <p className="text-xs text-slate-400">Start or view active work orders</p>
          </div>
          <span className="ml-auto text-slate-500">→</span>
        </Link>

        <Link
          href="/tasks"
          className="flex min-h-16 items-center gap-4 rounded-xl bg-slate-800 px-5 active:bg-slate-700"
        >
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-semibold text-white">My Tasks</p>
            <p className="text-xs text-slate-400">Section checklists for today</p>
          </div>
          <span className="ml-auto text-slate-500">→</span>
        </Link>

        <Link
          href="/history"
          className="flex min-h-16 items-center gap-4 rounded-xl bg-slate-800 px-5 active:bg-slate-700"
        >
          <span className="text-2xl">↺</span>
          <div>
            <p className="font-semibold text-white">History</p>
            <p className="text-xs text-slate-400">Your recent completed jobs</p>
          </div>
          <span className="ml-auto text-slate-500">→</span>
        </Link>
      </div>

      {/* Sign out */}
      <button
        onClick={() => { clearSession(); router.replace("/"); }}
        className="mt-4 text-sm text-slate-500 underline-offset-2 active:text-slate-300"
      >
        Sign out
      </button>
    </div>
  );
}
