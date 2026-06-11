import { createServerClient } from "@/lib/supabase/server";
import JobsTable from "@/components/dashboard/JobsTable";
import SectionProgress from "@/components/dashboard/SectionProgress";
import StatsBar from "@/components/dashboard/StatsBar";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createServerClient();
  const today = new Date().toISOString().split("T")[0];

  const [activeJobsRes, statsRes, sectionsRes, tasksRes, completionsRes] = await Promise.all([
    supabase
      .from("job_logs")
      .select(`
        id, start_time, parts_completed,
        operators(name),
        work_orders(job_number, product_name),
        sections(name, color)
      `)
      .eq("status", "active")
      .order("start_time", { ascending: false }),

    supabase
      .from("job_logs")
      .select("operator_id, parts_completed")
      .eq("status", "active"),

    supabase.from("sections").select("id, name, color"),

    supabase.from("tasks").select("id, section_id").eq("is_active", true),

    supabase
      .from("task_completions")
      .select("task_id")
      .gte("completed_at", `${today}T00:00:00`),
  ]);

  const activeJobs = activeJobsRes.data ?? [];
  const statRows = statsRes.data ?? [];
  const sections = sectionsRes.data ?? [];
  const tasks = tasksRes.data ?? [];
  const completedTaskIds = new Set((completionsRes.data ?? []).map((c) => c.task_id));

  const stats = {
    activeCount: statRows.length,
    uniqueOperators: new Set(statRows.map((r) => r.operator_id)).size,
    partsToday: statRows.reduce((sum, r) => sum + (r.parts_completed ?? 0), 0),
  };

  const sectionProgress = sections.map((s) => {
    const sectionTasks = tasks.filter((t) => t.section_id === s.id);
    const completed = sectionTasks.filter((t) => completedTaskIds.has(t.id)).length;
    return {
      ...s,
      total: sectionTasks.length,
      completed,
      pct: sectionTasks.length > 0 ? Math.round((completed / sectionTasks.length) * 100) : 0,
    };
  });

  return { activeJobs, stats, sectionProgress };
}

export default async function DashboardPage() {
  const { activeJobs, stats, sectionProgress } = await getDashboardData();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">FloorOps</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Production Overview</h1>
        </div>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("en-AU", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <StatsBar stats={stats} />

      <div className="mt-8">
        <JobsTable
          initialJobs={activeJobs as never[]}
          supabaseUrl={process.env.SUPABASE_URL!}
          supabaseAnonKey={process.env.SUPABASE_ANON_KEY!}
        />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Section Task Progress
        </h2>
        <SectionProgress sections={sectionProgress} />
      </div>
    </div>
  );
}
