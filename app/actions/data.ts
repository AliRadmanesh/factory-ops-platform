"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Operator, WorkOrder, Section, JobLog, Task, TaskCompletion } from "@/lib/types";

export async function getActiveOperators(): Promise<Pick<Operator, "id" | "name" | "section_id" | "is_active">[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("operators")
    .select("id, name, section_id, is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
}

export async function getOperatorById(id: string): Promise<Pick<Operator, "id" | "name" | "section_id"> | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("operators")
    .select("id, name, section_id")
    .eq("id", id)
    .single();
  return data;
}

export async function getSectionById(id: string): Promise<Section | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("sections").select("*").eq("id", id).single();
  return data;
}

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

export async function getJobById(id: string): Promise<(JobLog & { work_orders: WorkOrder }) | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("job_logs")
    .select("*, work_orders(*)")
    .eq("id", id)
    .single();
  return data as (JobLog & { work_orders: WorkOrder }) | null;
}

export async function getActiveJob(
  operatorId: string
): Promise<(JobLog & { work_orders: WorkOrder }) | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("job_logs")
    .select("*, work_orders(*)")
    .eq("operator_id", operatorId)
    .eq("status", "active")
    .maybeSingle();
  return data as (JobLog & { work_orders: WorkOrder }) | null;
}

export async function getJobHistory(operatorId: string): Promise<
  {
    id: string;
    start_time: string;
    end_time: string | null;
    parts_completed: number;
    work_orders: { job_number: string; product_name: string } | null;
  }[]
> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("job_logs")
    .select("id, start_time, end_time, parts_completed, work_orders(job_number, product_name)")
    .eq("operator_id", operatorId)
    .eq("status", "completed")
    .order("end_time", { ascending: false })
    .limit(5);
  return (data ?? []) as never[];
}

export async function getTasksWithCompletions(
  sectionId: string,
  operatorId: string
): Promise<{ tasks: (Task & { completion?: TaskCompletion })[]; activeJobId: string | null; section: Section | null }> {
  const supabase = await createServerClient();
  const today = new Date().toISOString().split("T")[0];

  const [tasksRes, completionsRes, jobRes, sectionRes] = await Promise.all([
    supabase.from("tasks").select("*").eq("section_id", sectionId).eq("is_active", true).order("order_index"),
    supabase.from("task_completions").select("*").eq("operator_id", operatorId).gte("completed_at", `${today}T00:00:00`),
    supabase.from("job_logs").select("id").eq("operator_id", operatorId).eq("status", "active").maybeSingle(),
    supabase.from("sections").select("*").eq("id", sectionId).single(),
  ]);

  const completionMap = new Map((completionsRes.data ?? []).map((c) => [c.task_id, c]));
  const tasks = (tasksRes.data ?? []).map((t) => ({ ...t, completion: completionMap.get(t.id) }));

  return { tasks, activeJobId: jobRes.data?.id ?? null, section: sectionRes.data };
}

export type DashboardJob = {
  id: string;
  start_time: string;
  parts_completed: number;
  operators: { name: string } | null;
  work_orders: { job_number: string; product_name: string } | null;
  sections: { name: string; color: string } | null;
};

export async function getActiveJobsForDashboard(): Promise<DashboardJob[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("job_logs")
    .select(`
      id, start_time, parts_completed,
      operators(name),
      work_orders(job_number, product_name),
      sections(name, color)
    `)
    .eq("status", "active")
    .order("start_time", { ascending: false });
  return (data ?? []) as unknown as DashboardJob[];
}
