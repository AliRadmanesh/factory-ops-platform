"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import { updatePartsCount, endJob } from "@/app/actions/jobs";
import type { JobLog, WorkOrder } from "@/lib/types";

type JobWithWorkOrder = JobLog & { work_orders: WorkOrder };

function formatElapsed(startTime: string) {
  const ms = Date.now() - new Date(startTime).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ActiveJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<JobWithWorkOrder | null>(null);
  const [parts, setParts] = useState(0);
  const [elapsed, setElapsed] = useState("");
  const [showEndSheet, setShowEndSheet] = useState(false);
  const [ending, setEnding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace("/"); return; }

    supabase
      .from("job_logs")
      .select("*, work_orders(*)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) { router.replace("/job-log"); return; }
        setJob(data);
        setParts(data.parts_completed);
      });
  }, [id, router]);

  useEffect(() => {
    if (!job) return;
    const update = () => setElapsed(formatElapsed(job.start_time));
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [job]);

  const saveParts = useCallback(
    (count: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updatePartsCount(id, count), 500);
    },
    [id]
  );

  const increment = () => {
    const next = parts + 1;
    setParts(next);
    saveParts(next);
  };

  const decrement = () => {
    if (parts === 0) return;
    const next = parts - 1;
    setParts(next);
    saveParts(next);
  };

  const handleEnd = async () => {
    setEnding(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const { error } = await endJob(id, parts);
    if (!error) {
      router.replace("/job-log");
    } else {
      setEnding(false);
    }
  };

  if (!job) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-5 py-6">
        {/* Job info */}
        <div>
          <span className="text-xs font-semibold text-blue-400">{job.work_orders.job_number}</span>
          <h1 className="mt-0.5 text-xl font-bold text-white">{job.work_orders.product_name}</h1>
          <p className="mt-1 text-sm text-slate-400">{job.work_orders.product_type} · Started {elapsed} ago</p>
        </div>

        {/* Parts counter */}
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-800 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Parts Completed</p>
          <span className="text-7xl font-bold tabular-nums text-white">{parts}</span>
          <div className="flex gap-6">
            <button
              onPointerDown={decrement}
              disabled={parts === 0}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-3xl font-bold text-white active:bg-slate-600 disabled:opacity-30"
            >
              −
            </button>
            <button
              onPointerDown={increment}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white active:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>

        {/* End job */}
        <button
          onClick={() => setShowEndSheet(true)}
          className="w-full rounded-xl border border-red-800 py-4 font-semibold text-red-400 active:bg-red-900/20"
        >
          End Job
        </button>
      </div>

      {/* End job confirmation sheet */}
      {showEndSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-slate-900 p-6 pb-safe">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">End Job?</p>
            <p className="mt-1 text-lg font-bold text-white">{job.work_orders.product_name}</p>
            <p className="mt-1 text-slate-300">
              Final count: <span className="font-bold text-white">{parts} parts</span>
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowEndSheet(false)}
                className="flex-1 rounded-xl border border-slate-700 py-4 font-medium text-slate-300 active:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEnd}
                disabled={ending}
                className="flex-1 rounded-xl bg-red-600 py-4 font-semibold text-white active:bg-red-700 disabled:opacity-50"
              >
                {ending ? "Ending…" : "Confirm End"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
