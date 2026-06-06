"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

interface HistoryRow {
  id: string;
  start_time: string;
  end_time: string | null;
  parts_completed: number;
  work_orders: { job_number: string; product_name: string } | null;
}

function formatDuration(start: string, end: string | null) {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }

    supabase
      .from("job_logs")
      .select("id, start_time, end_time, parts_completed, work_orders(job_number, product_name)")
      .eq("operator_id", s.id)
      .eq("status", "completed")
      .order("end_time", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRows((data ?? []) as unknown as HistoryRow[]);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold text-white">Recent Jobs</h1>
        <p className="mt-0.5 text-sm text-slate-400">Last 5 completed</p>
      </div>

      <ul className="space-y-2 px-4 pb-8">
        {rows.length === 0 && (
          <p className="text-center text-slate-400">No completed jobs yet.</p>
        )}
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl bg-slate-800 px-5 py-4">
            <p className="text-xs font-semibold text-blue-400">{row.work_orders?.job_number}</p>
            <p className="font-medium text-white">{row.work_orders?.product_name}</p>
            <div className="mt-2 flex gap-4 text-sm text-slate-400">
              <span>{row.parts_completed} parts</span>
              <span>·</span>
              <span>{formatDuration(row.start_time, row.end_time)}</span>
              {row.end_time && (
                <>
                  <span>·</span>
                  <span>
                    {new Date(row.end_time).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
