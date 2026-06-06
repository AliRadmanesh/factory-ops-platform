interface Stats {
  activeCount: number;
  uniqueOperators: number;
  partsToday: number;
}

export default function StatsBar({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Active Jobs",       value: stats.activeCount,      icon: "⏱" },
    { label: "Operators Working", value: stats.uniqueOperators,  icon: "👷" },
    { label: "Parts Today",       value: stats.partsToday,       icon: "⚙" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ label, value, icon }) => (
        <div key={label} className="rounded-xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">{icon} {label}</p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
