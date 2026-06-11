"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getActiveJob } from "@/app/actions/data";
import type { JobLog, WorkOrder } from "@/lib/types";

type ActiveJobRow = JobLog & { work_orders: WorkOrder };

export default function ActiveJobBanner() {
  const [job, setJob] = useState<ActiveJobRow | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    getActiveJob(session.id).then((data) => setJob(data));
  }, []);

  if (!job) return null;

  return (
    <Link
      href={`/job-log/${job.id}`}
      className="flex items-center gap-3 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
    >
      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-white" />
      <span className="truncate">
        {job.work_orders.job_number} — {job.work_orders.product_name}
      </span>
      <span className="ml-auto shrink-0 text-blue-200">Open →</span>
    </Link>
  );
}
