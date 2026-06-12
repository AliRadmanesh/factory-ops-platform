import type { Metadata } from "next";
import ActiveJobBanner from "@/components/operator/ActiveJobBanner";
import OfflineBanner from "@/components/operator/OfflineBanner";
import OperatorNav from "@/components/operator/OperatorNav";

export const metadata: Metadata = {
  title: "FloorOps — Operator",
};

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-950">
      <OfflineBanner />
      <ActiveJobBanner />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      <OperatorNav />
    </div>
  );
}
