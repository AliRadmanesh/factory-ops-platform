interface SectionRow {
  id: string;
  name: string;
  color: string;
  total: number;
  completed: number;
  pct: number;
}

export default function SectionProgress({ sections }: { sections: SectionRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {sections.map((s) => (
        <div key={s.id} className="rounded-xl bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm font-medium text-white">{s.name}</span>
            </div>
            <span className="text-sm font-bold text-white">{s.pct}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {s.completed}/{s.total} tasks complete
          </p>
        </div>
      ))}
    </div>
  );
}
