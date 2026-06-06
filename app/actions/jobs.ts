"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { JobLog } from "@/lib/types";

export async function startJob(
  operatorId: string,
  workOrderId: string,
  sectionId: string
): Promise<{ data: JobLog | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: existing } = await supabase
    .from("job_logs")
    .select("id")
    .eq("operator_id", operatorId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) return { data: null, error: "You already have an active job." };

  const { data, error } = await supabase
    .from("job_logs")
    .insert({
      operator_id: operatorId,
      work_order_id: workOrderId,
      section_id: sectionId,
      start_time: new Date().toISOString(),
      status: "active",
      parts_completed: 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updatePartsCount(
  jobLogId: string,
  partsCompleted: number
): Promise<void> {
  const supabase = await createServerClient();
  await supabase
    .from("job_logs")
    .update({ parts_completed: partsCompleted })
    .eq("id", jobLogId);
}

export async function endJob(
  jobLogId: string,
  partsCompleted: number
): Promise<{ error: string | null }> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("job_logs")
    .update({
      end_time: new Date().toISOString(),
      status: "completed",
      parts_completed: partsCompleted,
    })
    .eq("id", jobLogId);

  return { error: error?.message ?? null };
}
