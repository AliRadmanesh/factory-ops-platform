"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface JobRow {
  id: string;
  start_time: string;
  parts_completed: number;
  operators: { name: string } | null;
  work_orders: { job_number: string; product_name: string } | null;
  sections: { name: string; color: string } | null;
}

function elapsed(start: string) {
  const ms = Date.now() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function JobsTable({ initialJobs }: { initialJobs: JobRow[] }) {
  const [jobs, setJobs] = useState<JobRow[]>(initialJobs);
  const [, tick] = useState(0);

  // Tick elapsed time every minute
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("job_logs_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_logs" },
        () => {
          supabase
            .from("job_logs")
            .select(`
              id, start_time, parts_completed,
              operators(name),
              work_orders(job_number, product_name),
              sections(name, color)
            `)
            .eq("status", "active")
            .order("start_time", { ascending: false })
            .then(({ data }) => setJobs((data ?? []) as unknown as JobRow[]));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Active Jobs
      </h2>

      {jobs.length === 0 ? (
        <div className="rounded-xl bg-slate-900 p-8 text-center text-slate-500">
          No active jobs right now.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl bg-slate-900 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Operator</th>
                  <th className="px-5 py-3">Work Order</th>
                  <th className="px-5 py-3">Section</th>
                  <th className="px-5 py-3">Elapsed</th>
                  <th className="px-5 py-3 text-right">Parts</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr
                    key={job.id}
                    className={i < jobs.length - 1 ? "border-b border-slate-800" : ""}
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {job.operators?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{job.work_orders?.product_name}</p>
                      <p className="text-xs text-blue-400">{job.work_orders?.job_number}</p>
                    </td>
                    <td className="px-5 py-4">
                      {job.sections && (
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: job.sections.color }}
                        >
                          {job.sections.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{elapsed(job.start_time)}</td>
                    <td className="px-5 py-4 text-right font-bold text-white">
                      {job.parts_completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <ul className="space-y-2 md:hidden">
            {jobs.map((job) => (
              <li key={job.id} className="rounded-xl bg-slate-900 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{job.operators?.name}</p>
                    <p className="text-sm text-blue-400">{job.work_orders?.job_number}</p>
                    <p className="text-sm text-slate-300">{job.work_orders?.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{job.parts_completed}</p>
                    <p className="text-xs text-slate-400">{elapsed(job.start_time)}</p>
                  </div>
                </div>
                {job.sections && (
                  <span
                    className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: job.sections.color }}
                  >
                    {job.sections.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
