"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { getTasksWithCompletions } from "@/app/actions/data";
import { completeTask } from "@/app/actions/tasks";
import type { OperatorSession, Task, TaskCompletion, Section } from "@/lib/types";

type TaskWithCompletion = Task & { completion?: TaskCompletion };

export default function TasksPage() {
  const router = useRouter();
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [tasks, setTasks] = useState<TaskWithCompletion[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }
    setSession(s);
    getTasksWithCompletions(s.sectionId, s.id).then(({ tasks, activeJobId, section }) => {
      setTasks(tasks);
      setActiveJobId(activeJobId);
      setSection(section);
      setLoading(false);
    });
  }, [router]);

  const handleTap = async (task: TaskWithCompletion) => {
    if (task.completion) return;
    const completedAt = new Date().toISOString();

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
  const sectionColor = section?.color ?? "#2563eb";

  return (
    <div className="flex flex-col">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sectionColor }} />
          <h1 className="text-xl font-bold text-white">My Tasks</h1>
        </div>
        <p className="mt-0.5 text-sm text-slate-400">
          {done}/{tasks.length} complete today
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: tasks.length ? `${(done / tasks.length) * 100}%` : "0%",
              backgroundColor: sectionColor,
            }}
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
                className={`flex min-h-[56px] w-full items-center gap-4 rounded-xl border-l-4 px-5 py-3 text-left transition-colors ${
                  isDone ? "bg-slate-900" : "bg-slate-800 active:bg-slate-700"
                }`}
                style={{ borderLeftColor: isDone ? "#1e293b" : sectionColor }}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-600 text-transparent"
                  }`}
                >
                  ✓
                </span>

                <div className="flex-1">
                  <p className={`text-sm font-medium leading-snug ${isDone ? "text-slate-500 line-through" : "text-white"}`}>
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
