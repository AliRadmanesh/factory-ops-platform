"use server";

import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase/server";

export async function validatePin(
  operatorId: string,
  pin: string
): Promise<{ success: boolean; operator?: { id: string; name: string; section_id: string } }> {
  const supabase = await createServerClient();
  const { data: operator, error } = await supabase
    .from("operators")
    .select("id, name, section_id, pin")
    .eq("id", operatorId)
    .eq("is_active", true)
    .single();

  if (error || !operator) return { success: false };

  const match = await bcrypt.compare(pin, operator.pin);
  if (!match) return { success: false };

  return {
    success: true,
    operator: { id: operator.id, name: operator.name, section_id: operator.section_id },
  };
}
