"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOpenWorkOrders } from "@/app/actions/data";
import { startJob } from "@/app/actions/jobs";
import type { OperatorSession, WorkOrder } from "@/lib/types";

const TYPE_STYLES: Record<string, string> = {
  "Hydraulics":    "bg-blue-900/50 text-blue-400",
  "Mechanical":    "bg-slate-700 text-slate-300",
  "Fluid Control": "bg-violet-900/50 text-violet-400",
};

function typeStyle(t: string) {
  return TYPE_STYLES[t] ?? "bg-slate-700 text-slate-300";
}

export default function JobLogPage() {
  const router = useRouter();
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }
    setSession(s);
    getOpenWorkOrders().then((data) => {
      setWorkOrders(data);
      setLoading(false);
    });
  }, [router]);

  const handleStart = async (wo: WorkOrder) => {
    if (!session || starting) return;
    setStarting(wo.id);
    setError("");
    const { data, error: err } = await startJob(session.id, wo.id, session.sectionId);
    if (err) {
      setError(err);
      setStarting(null);
      setConfirmId(null);
    } else if (data) {
      router.push(`/job-log/${data.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold text-white">Work Orders</h1>
        <p className="mt-0.5 text-sm text-slate-400">Tap a job to start</p>
        {error && <p className="mt-3 rounded-lg bg-red-900/40 px-4 py-2 text-sm text-red-400">{error}</p>}
      </div>

      <ul className="space-y-2 px-4 pb-8">
        {workOrders.length === 0 && (
          <p className="text-center text-slate-400">No open work orders.</p>
        )}
        {workOrders.map((wo) => (
          <li key={wo.id}>
            <button
              onClick={() => setConfirmId(wo.id)}
              className="flex min-h-16 w-full items-center gap-4 rounded-xl bg-slate-800 px-5 py-4 text-left active:bg-slate-700"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-400">{wo.job_number}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeStyle(wo.product_type)}`}>
                    {wo.product_type}
                  </span>
                </div>
                <p className="mt-0.5 font-medium text-white truncate">{wo.product_name}</p>
                <p className="text-xs text-slate-500">Qty {wo.quantity_required}</p>
              </div>
              <span className="shrink-0 text-slate-500">›</span>
            </button>
          </li>
        ))}
      </ul>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-slate-900 p-6 pb-safe">
            {(() => {
              const wo = workOrders.find((w) => w.id === confirmId)!;
              return (
                <>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Start Job?</p>
                  <p className="mt-1 text-lg font-bold text-white">{wo.product_name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-blue-400">{wo.job_number}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeStyle(wo.product_type)}`}>
                      {wo.product_type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">Qty required: {wo.quantity_required}</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => { setConfirmId(null); setError(""); }}
                      className="flex-1 rounded-xl border border-slate-700 py-4 font-medium text-slate-300 active:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStart(wo)}
                      disabled={!!starting}
                      className="flex-1 rounded-xl bg-blue-600 py-4 font-semibold text-white active:bg-blue-700 disabled:opacity-50"
                    >
                      {starting === wo.id ? "Starting…" : "Start Job"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
