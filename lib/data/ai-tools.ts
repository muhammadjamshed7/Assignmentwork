import { requireSupabase } from "@/lib/data/client";
import { mapAiTool } from "@/lib/data/mappers";
import { AiToolUsage } from "@/lib/data/types";

export async function listAiTools(): Promise<AiToolUsage[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("ai_tools")
    .select("id, tool_name, usage_count, active_students, related_problems, success_rate")
    .order("usage_count", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAiTool);
}

export async function createAiTool(input: {
  toolName: string;
  usageCount?: number;
  activeStudents?: number;
  relatedProblems?: number;
  successRate?: number;
}) {
  const supabase = requireSupabase();
  const toolName = input.toolName.trim();

  if (!toolName) {
    throw new Error("Tool name is required.");
  }

  const { data, error } = await supabase
    .from("ai_tools")
    .insert({
      tool_name: toolName,
      usage_count: input.usageCount ?? 0,
      active_students: input.activeStudents ?? 0,
      related_problems: input.relatedProblems ?? 0,
      success_rate: input.successRate ?? 100,
    })
    .select("id, tool_name, usage_count, active_students, related_problems, success_rate")
    .single();

  if (error) throw error;
  return mapAiTool(data);
}

export async function updateAiTool(toolId: string, input: {
  toolName: string;
  usageCount: number;
  activeStudents: number;
  relatedProblems: number;
  successRate: number;
}) {
  const supabase = requireSupabase();
  const toolName = input.toolName.trim();

  if (!toolName) {
    throw new Error("Tool name is required.");
  }

  const { data, error } = await supabase
    .from("ai_tools")
    .update({
      tool_name: toolName,
      usage_count: input.usageCount,
      active_students: input.activeStudents,
      related_problems: input.relatedProblems,
      success_rate: input.successRate,
    })
    .eq("id", toolId)
    .select("id, tool_name, usage_count, active_students, related_problems, success_rate")
    .single();

  if (error) throw error;
  return mapAiTool(data);
}

export async function deleteAiTool(toolId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("ai_tools").delete().eq("id", toolId);
  if (error) throw error;
}
