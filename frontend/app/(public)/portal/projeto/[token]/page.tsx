import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ProjectPortalView } from "./portal-view";

interface Props {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectPortalPage({ params }: Props) {
  const { token } = await params;
  const supabase = createServiceClient();

  // 1. Lookup project by portal_token
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, client, client_company, due_date_start, due_date_end, cover_url")
    .eq("portal_token", token)
    .single();

  if (!project) notFound();

  // 2. Fetch tasks (non-parent, visible statuses only)
  const { data: tasks } = await supabase
    .from("os_tasks")
    .select(
      "id, title, status, is_completed, due_date, requires_client_approval, client_approval_status, client_approval_comment, client_approval_at"
    )
    .eq("project_id", project.id)
    .is("parent_id", null)
    .in("status", ["em_andamento", "revisao", "concluida"])
    .order("order_index", { ascending: true });

  // 3. Fetch latest status update
  let latestUpdate: unknown = null;
  try {
    const { data } = await supabase
      .from("project_status_updates")
      .select("id, status, summary, created_at, author_name")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    latestUpdate = data;
  } catch {
    // Table may not exist yet
  }

  // 4. Count pending approvals
  type PortalTask = {
    id: string; title: string; status: string; is_completed: boolean;
    due_date: string | null; requires_client_approval: boolean | null;
    client_approval_status: string | null; client_approval_comment: string | null;
    client_approval_at: string | null;
  };
  const allTasks = (tasks ?? []) as PortalTask[];
  const pendingApprovals = allTasks.filter(
    (t) =>
      t.requires_client_approval &&
      (t.client_approval_status === "pending" || t.client_approval_status === "none"),
  ).length;

  // 5. Count public comments
  let commentsCount = 0;
  try {
    const supa = supabase as unknown as { from: (name: string) => ReturnType<typeof supabase.from> };
    const { count } = await supa.from("portal_comments")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id)
      .eq("is_internal", false);
    commentsCount = count ?? 0;
  } catch {
    // Table may not exist
  }

  // 6. Compute progress
  const completedTasks = allTasks.filter((t) => t.is_completed);
  const progressPercent =
    allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

  return (
    <ProjectPortalView
      project={project}
      tasks={allTasks}
      latestUpdate={latestUpdate as never}
      progressPercent={progressPercent}
      completedCount={completedTasks.length}
      totalCount={allTasks.length}
      token={token}
      pendingApprovals={pendingApprovals}
      commentsCount={commentsCount}
    />
  );
}
