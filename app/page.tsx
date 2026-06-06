"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Operator } from "@/lib/types";

export default function OperatorSelectionPage() {
  const router = useRouter();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace("/home");
      return;
    }
    supabase
      .from("operators")
      .select("id, name, section_id, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setOperators(data ?? []);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-950 pt-safe">
      <header className="px-6 pb-4 pt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          IPI Packers
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Who are you?</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {operators.length === 0 ? (
          <p className="mt-8 text-center text-slate-400">No operators available.</p>
        ) : (
          <ul className="space-y-2">
            {operators.map((op) => (
              <li key={op.id}>
                <button
                  onClick={() => router.push(`/auth?operator=${op.id}`)}
                  className="flex min-h-16 w-full items-center rounded-xl bg-slate-800 px-5 text-left active:bg-slate-700"
                >
                  <span className="text-lg font-medium text-white">{op.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
