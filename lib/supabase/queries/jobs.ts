import { createServerClient } from "../server";
import type { JobLog, WorkOrder } from "@/lib/types";

export async function getOpenWorkOrders(): Promise<WorkOrder[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("work_orders")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getActiveJobLog(operatorId: string): Promise<JobLog | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("job_logs")
    .select("*")
    .eq("operator_id", operatorId)
    .eq("status", "active")
    .maybeSingle();

  return data;
}

export async function getRecentJobLogs(operatorId: string, limit = 5): Promise<JobLog[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("job_logs")
    .select("*, work_orders(job_number, product_name)")
    .eq("operator_id", operatorId)
    .eq("status", "completed")
    .order("end_time", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
