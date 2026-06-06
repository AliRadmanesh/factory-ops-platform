"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import { completeTask } from "@/app/actions/tasks";
import type { OperatorSession, Task, TaskCompletion } from "@/lib/types";

type TaskWithCompletion = Task & { completion?: TaskCompletion };

export default function TasksPage() {
  const router = useRouter();
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [tasks, setTasks] = useState<TaskWithCompletion[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }
    setSession(s);

    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("section_id", s.sectionId)
        .eq("is_active", true)
        .order("order_index"),
      supabase
        .from("task_completions")
        .select("*")
        .eq("operator_id", s.id)
        .gte("completed_at", `${today}T00:00:00`),
      supabase
        .from("job_logs")
        .select("id")
        .eq("operator_id", s.id)
        .eq("status", "active")
        .maybeSingle(),
    ]).then(([tasksRes, completionsRes, jobRes]) => {
      const completionMap = new Map(
        (completionsRes.data ?? []).map((c) => [c.task_id, c])
      );
      const merged = (tasksRes.data ?? []).map((t) => ({
        ...t,
        completion: completionMap.get(t.id),
      }));
      setTasks(merged);
      setActiveJobId(jobRes.data?.id ?? null);
      setLoading(false);
    });
  }, [router]);

  const handleTap = async (task: TaskWithCompletion) => {
    if (task.completion) return; // already done
    const completedAt = new Date().toISOString();

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completion: {
                id: "optimistic",
                task_id: task.id,
                operator_id: session!.id,
                job_log_id: activeJobId,
                completed_at: completedAt,
              },
            }
          : t
      )
    );

    const { error } = await completeTask(task.id, session!.id, activeJobId);
    if (error) {
      // Revert optimistic update on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completion: undefined } : t))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  const done = tasks.filter((t) => t.completion).length;

  return (
    <div className="flex flex-col">
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold text-white">My Tasks</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {done}/{tasks.length} complete today
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: tasks.length ? `${(done / tasks.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <ul className="space-y-2 px-4 pb-8">
        {tasks.length === 0 && (
          <p className="text-center text-slate-400">No tasks for this section.</p>
        )}
        {tasks.map((task) => {
          const isDone = !!task.completion;
          const time = task.completion
            ? new Date(task.completion.completed_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <li key={task.id}>
              <button
                onClick={() => handleTap(task)}
                disabled={isDone}
                className={`flex min-h-[56px] w-full items-center gap-4 rounded-xl px-5 py-3 text-left transition-colors ${
                  isDone ? "bg-slate-900" : "bg-slate-800 active:bg-slate-700"
                }`}
              >
                {/* Checkmark */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-600 text-transparent"
                  }`}
                >
                  ✓
                </span>

                <div className="flex-1">
                  <p
                    className={`text-sm font-medium leading-snug ${
                      isDone ? "text-slate-500 line-through" : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  {isDone && time && (
                    <p className="text-xs text-slate-600">Completed {time}</p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    task.frequency === "daily"
                      ? "bg-slate-700 text-slate-400"
                      : "bg-blue-900/50 text-blue-400"
                  }`}
                >
                  {task.frequency === "daily" ? "Daily" : "Per job"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
