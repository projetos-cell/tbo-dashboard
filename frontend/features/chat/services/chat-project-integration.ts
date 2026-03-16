import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { createChannel } from "./chat";

/**
 * Ensures a chat channel exists for a given project.
 * If one already exists, returns the existing channel.
 * If not, creates a new private channel named after the project.
 */
export async function ensureProjectChannel(
  supabase: SupabaseClient<Database>,
  options: {
    projectId: string;
    projectName: string;
    tenantId: string;
    createdBy: string;
    memberIds?: string[];
  },
) {
  const { projectId, projectName, tenantId, createdBy, memberIds = [] } = options;

  // Check if a channel for this project already exists
  const { data: existing } = await supabase
    .from("chat_channels")
    .select("id, name")
    .eq("project_id" as never, projectId)
    .eq("is_archived", false)
    .maybeSingle();

  if (existing) return existing;

  // Create a new channel for this project
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  const channel = await createChannel(supabase, {
    name: slug,
    description: `Canal do projeto ${projectName}`,
    type: "private",
    tenant_id: tenantId,
    created_by: createdBy,
    is_archived: false,
    project_id: projectId,
  } as never);

  // Add members to the channel
  const uniqueIds = [...new Set([createdBy, ...memberIds])];
  if (uniqueIds.length > 0) {
    await supabase.from("chat_channel_members").insert(
      uniqueIds.map((uid) => ({
        channel_id: channel.id,
        user_id: uid,
        role: uid === createdBy ? "admin" : "member",
      })) as never,
    );
  }

  return channel;
}

/**
 * Returns the chat channel linked to a project, if any.
 */
export async function getProjectChannel(
  supabase: SupabaseClient<Database>,
  projectId: string,
) {
  const { data } = await supabase
    .from("chat_channels")
    .select("id, name, description")
    .eq("project_id" as never, projectId)
    .eq("is_archived", false)
    .maybeSingle();

  return data ?? null;
}
