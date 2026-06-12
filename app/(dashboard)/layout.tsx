import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FloorOps — Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-slate-950 md:flex-row">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">FloorOps</p>
          <p className="text-sm font-bold text-white">Operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white"
          >
            <span>⊞</span> Production
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Live</span>
          </div>
        </div>
      </header>

      {/* Sidebar (tablet+) */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        <div className="px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            FloorOps
          </p>
          <p className="mt-0.5 text-sm font-bold text-white">Operations</p>
        </div>
        <nav className="flex-1 px-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-slate-800"
          >
            <span>⊞</span> Production
          </Link>
        </nav>
        <div className="border-t border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Live</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
