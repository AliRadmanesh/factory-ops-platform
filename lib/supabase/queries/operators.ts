import { createServerClient } from "../server";
import type { Operator } from "@/lib/types";

export async function getActiveOperators(): Promise<Operator[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("operators")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

export async function getOperatorById(id: string): Promise<Operator | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("operators")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
