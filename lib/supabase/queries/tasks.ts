import { createServerClient } from "../server";
import type { Task, TaskCompletion } from "@/lib/types";

export async function getTasksForSection(sectionId: string): Promise<Task[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("section_id", sectionId)
    .eq("is_active", true)
    .order("order_index");

  if (error) throw error;
  return data;
}

export async function getTodayCompletions(operatorId: string): Promise<TaskCompletion[]> {
  const supabase = await createServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("task_completions")
    .select("*")
    .eq("operator_id", operatorId)
    .gte("completed_at", `${today}T00:00:00`);

  if (error) throw error;
  return data;
}
