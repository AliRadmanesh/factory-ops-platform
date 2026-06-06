"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function completeTask(
  taskId: string,
  operatorId: string,
  jobLogId: string | null
): Promise<{ error: string | null }> {
  const supabase = await createServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("task_completions")
    .select("id")
    .eq("task_id", taskId)
    .eq("operator_id", operatorId)
    .gte("completed_at", `${today}T00:00:00`)
    .maybeSingle();

  if (existing) return { error: null };

  const { error } = await supabase.from("task_completions").insert({
    task_id: taskId,
    operator_id: operatorId,
    job_log_id: jobLogId,
    completed_at: new Date().toISOString(),
  });

  return { error: error?.message ?? null };
}
