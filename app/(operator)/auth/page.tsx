"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { validatePin } from "@/app/actions/auth";
import { saveSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

function PinEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const operatorId = params.get("operator") ?? "";

  const [operatorName, setOperatorName] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!operatorId) { router.replace("/"); return; }
    supabase
      .from("operators")
      .select("name, section_id")
      .eq("id", operatorId)
      .single()
      .then(({ data }) => {
        if (!data) { router.replace("/"); return; }
        setOperatorName(data.name);
        setSectionId(data.section_id);
      });
  }, [operatorId, router]);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) handleSubmit(next);
  };

  const handleBackspace = () => setPin((p) => p.slice(0, -1));

  const handleSubmit = async (value = pin) => {
    if (value.length !== 4 || submitting) return;
    setSubmitting(true);
    const result = await validatePin(operatorId, value);
    if (result.success && result.operator) {
      saveSession({ id: result.operator.id, name: result.operator.name, sectionId });
      router.replace("/home");
    } else {
      setError("Incorrect PIN — try again");
      setPin("");
      setSubmitting(false);
    }
  };

  const keys = ["1","2","3","4","5","6","7","8","9"];

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-8 bg-slate-950 px-6 pt-safe">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-slate-500">Enter PIN</p>
        <p className="mt-1 text-2xl font-bold text-white">{operatorName || "…"}</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-all ${
              i < pin.length ? "border-blue-500 bg-blue-500" : "border-slate-600 bg-transparent"
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm font-medium text-red-400">{error}</p>}

      {/* Numpad */}
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {keys.map((k) => (
          <button
            key={k}
            onPointerDown={() => handleDigit(k)}
            className="flex h-16 items-center justify-center rounded-xl bg-slate-800 text-2xl font-semibold text-white active:bg-slate-700"
          >
            {k}
          </button>
        ))}
        {/* backspace */}
        <button
          onPointerDown={handleBackspace}
          className="flex h-16 items-center justify-center rounded-xl bg-slate-800 text-xl text-slate-400 active:bg-slate-700"
        >
          ⌫
        </button>
        {/* 0 */}
        <button
          onPointerDown={() => handleDigit("0")}
          className="flex h-16 items-center justify-center rounded-xl bg-slate-800 text-2xl font-semibold text-white active:bg-slate-700"
        >
          0
        </button>
        {/* submit */}
        <button
          onPointerDown={() => handleSubmit()}
          disabled={pin.length !== 4 || submitting}
          className="flex h-16 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white active:bg-blue-700 disabled:opacity-40"
        >
          {submitting ? "…" : "→"}
        </button>
      </div>

      <button
        onClick={() => router.replace("/")}
        className="text-sm text-slate-500 underline-offset-2 active:text-slate-300"
      >
        Back
      </button>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <PinEntry />
    </Suspense>
  );
}
