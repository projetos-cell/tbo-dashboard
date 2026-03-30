import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface PortalTimelineItem {
  id: string;
  type: "status_update" | "approval" | "comment";
  title: string;
  description: string | null;
  status: string | null;
  author: string | null;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token obrigatorio" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Validate token
    const { data: project } = await supabase
      .from("projects")
      .select("id, tenant_id")
      .eq("portal_token", token)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Token invalido" },
        { status: 404 },
      );
    }

    const items: PortalTimelineItem[] = [];

    // 1. Status updates
    try {
      const { data: updates } = await supabase
        .from("project_status_updates")
        .select("id, status, summary, created_at, author_name")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (updates) {
        for (const u of updates) {
          items.push({
            id: `su_${u.id}`,
            type: "status_update",
            title: "Atualização de status",
            description: u.summary,
            status: u.status,
            author: u.author_name,
            created_at: u.created_at,
          });
        }
      }
    } catch {
      // Table may not exist yet
    }

    // 2. Approval log
    const supa = supabase as unknown as { from: (name: string) => ReturnType<typeof supabase.from> };

    try {
      const { data: approvals } = await (supa.from as (name: string) => ReturnType<typeof supabase.from>)("portal_approval_log")
        .select("id, task_id, status, decision, feedback, client_name, requested_at, responded_at")
        .eq("project_id", project.id)
        .order("requested_at", { ascending: false })
        .limit(20);

      if (approvals) {
        for (const a of approvals as Array<Record<string, unknown>>) {
          const decision = a.decision as string | null;
          const responded = !!a.responded_at;
          const desc = responded
            ? `${decision === "approved" ? "Aprovado" : "Reprovado"}${a.feedback ? ` — ${a.feedback}` : ""}`
            : "Aguardando aprovacao do cliente";

          items.push({
            id: `ap_${a.id}`,
            type: "approval",
            title: responded ? "Aprovacao respondida" : "Aprovacao solicitada",
            description: desc,
            status: decision ?? "pending",
            author: (a.client_name as string) ?? null,
            created_at: (responded ? a.responded_at : a.requested_at) as string,
          });
        }
      }
    } catch {
      // Table may not exist
    }

    // 3. Public comments
    try {
      const { data: comments } = await (supa.from as (name: string) => ReturnType<typeof supabase.from>)("portal_comments")
        .select("id, author_name, content, created_at, is_internal")
        .eq("project_id", project.id)
        .eq("is_internal", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (comments) {
        for (const c of comments as Array<Record<string, unknown>>) {
          items.push({
            id: `cm_${c.id}`,
            type: "comment",
            title: "Comentario",
            description: c.content as string,
            status: null,
            author: c.author_name as string,
            created_at: c.created_at as string,
          });
        }
      }
    } catch {
      // Table may not exist
    }

    // Sort all items by date descending
    items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return NextResponse.json({ items: items.slice(0, 50) });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
