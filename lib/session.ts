import type { OperatorSession } from "@/lib/types";

const SESSION_KEY = "operator_session";

export function getSession(): OperatorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OperatorSession;
  } catch {
    return null;
  }
}

export function saveSession(session: OperatorSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
