interface Stats {
  activeCount: number;
  uniqueOperators: number;
  partsToday: number;
}

export default function StatsBar({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Active Jobs",       value: stats.activeCount,     icon: "⏱", accent: "#2563eb" },
    { label: "Operators Working", value: stats.uniqueOperators, icon: "👷", accent: "#059669" },
    { label: "Parts Today",       value: stats.partsToday,      icon: "⚙",  accent: "#7c3aed" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {cards.map(({ label, value, icon, accent }) => (
        <div
          key={label}
          className="rounded-xl bg-slate-900 p-3 sm:p-5 border-t-2"
          style={{ borderTopColor: accent }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className="mr-0.5">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </p>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-bold tabular-nums text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
