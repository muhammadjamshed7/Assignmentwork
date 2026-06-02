import { requireSupabase } from "@/lib/data/client";
import { mapAiTool } from "@/lib/data/mappers";
import { AiToolUsage } from "@/lib/data/types";
import { assertAdmin } from "@/lib/auth/roles";

export async function listAiTools(): Promise<AiToolUsage[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("ai_tools")
    .select("id, tool_name, description, usage_count, active_students, related_problems, success_rate")
    .order("usage_count", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAiTool);
}

export async function createAiTool(input: {
  toolName: string;
  description?: string;
  usageCount?: number;
  activeStudents?: number;
  relatedProblems?: number;
  successRate?: number;
}) {
  await assertAdmin();

  const supabase = requireSupabase();
  const toolName = input.toolName.trim();
  const description = input.description?.trim() ?? "";

  if (!toolName) {
    throw new Error("Tool name is required.");
  }

  const { data, error } = await supabase
    .from("ai_tools")
    .insert({
      tool_name: toolName,
      description,
      usage_count: input.usageCount ?? 0,
      active_students: input.activeStudents ?? 0,
      related_problems: input.relatedProblems ?? 0,
      success_rate: input.successRate ?? 0,
    })
    .select("id, tool_name, description, usage_count, active_students, related_problems, success_rate")
    .single();

  if (error) throw error;
  return mapAiTool(data);
}

export async function updateAiTool(toolId: string, input: {
  toolName: string;
  description?: string;
  usageCount?: number;
  activeStudents?: number;
  relatedProblems?: number;
  successRate?: number;
}) {
  await assertAdmin();

  const supabase = requireSupabase();
  const toolName = input.toolName.trim();
  const description = input.description?.trim() ?? "";

  if (!toolName) {
    throw new Error("Tool name is required.");
  }

  const { data, error } = await supabase
    .from("ai_tools")
    .update({
      tool_name: toolName,
      description,
      usage_count: input.usageCount ?? 0,
      active_students: input.activeStudents ?? 0,
      related_problems: input.relatedProblems ?? 0,
      success_rate: input.successRate ?? 0,
    })
    .eq("id", toolId)
    .select("id, tool_name, description, usage_count, active_students, related_problems, success_rate")
    .single();

  if (error) throw error;
  return mapAiTool(data);
}

export async function deleteAiTool(toolId: string) {
  await assertAdmin();

  const supabase = requireSupabase();
  const { error } = await supabase.from("ai_tools").delete().eq("id", toolId);
  if (error) throw error;
}
