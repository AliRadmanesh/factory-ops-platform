"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";

const navItems = [
  { href: "/home",    label: "Home",    icon: "⌂" },
  { href: "/job-log", label: "Job Log", icon: "⏱" },
  { href: "/tasks",   label: "Tasks",   icon: "✓" },
  { href: "/history", label: "History", icon: "↺" },
];

export default function OperatorNav() {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!getSession());
  }, []);

  if (!hasSession) return null;

  return (
    <nav className="flex shrink-0 border-t border-slate-800 bg-slate-900 pb-safe">
      {navItems.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              active ? "text-blue-400" : "text-slate-500"
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
