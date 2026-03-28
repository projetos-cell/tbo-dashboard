import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface CrossProjectFile {
  id: string;
  source: "project_file" | "task_attachment";
  project_id: string | null;
  project_name: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  task_id?: string | null;
}

export interface FileStats {
  totalFiles: number;
  totalSizeBytes: number;
  byProject: Record<string, { count: number; name: string }>;
  byType: Record<string, number>;
}

export async function getCrossProjectFiles(
  supabase: SupabaseClient<Database>,
): Promise<CrossProjectFile[]> {
  const [projectFilesRes, taskAttachmentsRes] = await Promise.all([
    supabase
      .from("project_files")
      .select("id,project_id,name,web_view_link,mime_type,size_bytes,profile_id,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("task_attachments" as never)
      .select("id,task_id,file_name,file_url,file_type,file_size,uploaded_by,created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (projectFilesRes.error) throw projectFilesRes.error;
  if (taskAttachmentsRes.error) throw taskAttachmentsRes.error;

  const projectFiles = (projectFilesRes.data ?? []) as Array<{
    id: string;
    project_id: string | null;
    name: string;
    web_view_link: string | null;
    mime_type: string | null;
    size_bytes: number | null;
    profile_id: string | null;
    created_at: string | null;
  }>;

  const taskAttachments = (taskAttachmentsRes.data ?? []) as Array<{
    id: string;
    task_id: string;
    file_name: string;
    file_url: string;
    file_type: string | null;
    file_size: number | null;
    uploaded_by: string;
    created_at: string;
  }>;

  // Get project names for task attachments (via tasks)
  const taskIds = [...new Set(taskAttachments.map((a) => a.task_id))];
  let taskProjectMap = new Map<string, { project_id: string | null }>();

  if (taskIds.length > 0) {
    const { data: tasks } = await supabase
      .from("os_tasks")
      .select("id,project_id")
      .in("id", taskIds);
    taskProjectMap = new Map((tasks ?? []).map((t) => [t.id, { project_id: t.project_id }]));
  }

  // Get all unique project ids
  const projectIds = [
    ...new Set([
      ...projectFiles.map((f) => f.project_id).filter(Boolean),
      ...taskAttachments
        .map((a) => taskProjectMap.get(a.task_id)?.project_id)
        .filter(Boolean),
    ]),
  ] as string[];

  let projectNameMap = new Map<string, string>();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id,name")
      .in("id", projectIds);
    projectNameMap = new Map((projects ?? []).map((p) => [p.id, p.name]));
  }

  const result: CrossProjectFile[] = [
    ...projectFiles.map((f) => ({
      id: f.id,
      source: "project_file" as const,
      project_id: f.project_id,
      project_name: f.project_id ? (projectNameMap.get(f.project_id) ?? null) : null,
      file_name: f.name,
      file_url: f.web_view_link ?? "",
      file_type: f.mime_type,
      file_size: f.size_bytes,
      uploaded_by: f.profile_id,
      created_at: f.created_at ?? new Date().toISOString(),
    })),
    ...taskAttachments.map((a) => {
      const projectId = taskProjectMap.get(a.task_id)?.project_id ?? null;
      return {
        id: a.id,
        source: "task_attachment" as const,
        project_id: projectId,
        project_name: projectId ? (projectNameMap.get(projectId) ?? null) : null,
        file_name: a.file_name,
        file_url: a.file_url,
        file_type: a.file_type,
        file_size: a.file_size,
        uploaded_by: a.uploaded_by,
        created_at: a.created_at,
        task_id: a.task_id,
      };
    }),
  ];

  // Sort by created_at desc
  result.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return result;
}

export async function getFileStats(
  supabase: SupabaseClient<Database>,
): Promise<FileStats> {
  const files = await getCrossProjectFiles(supabase);

  let totalSizeBytes = 0;
  const byProject: FileStats["byProject"] = {};
  const byType: FileStats["byType"] = {};

  for (const file of files) {
    totalSizeBytes += file.file_size ?? 0;

    const projKey = file.project_id ?? "sem_projeto";
    if (!byProject[projKey]) {
      byProject[projKey] = { count: 0, name: file.project_name ?? "Sem projeto" };
    }
    byProject[projKey].count++;

    const typeKey = file.file_type?.split("/")[0] ?? "other";
    byType[typeKey] = (byType[typeKey] ?? 0) + 1;
  }

  return {
    totalFiles: files.length,
    totalSizeBytes,
    byProject,
    byType,
  };
}
