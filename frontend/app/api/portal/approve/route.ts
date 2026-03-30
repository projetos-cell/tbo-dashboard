import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface ApproveRequestBody {
  token: string;
  taskId: string;
  status: "approved" | "rejected";
  comment?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApproveRequestBody;

    // Validate required fields
    if (!body.token || !body.taskId || !body.status) {
      return NextResponse.json(
        { error: "Campos obrigatórios: token, taskId, status" },
        { status: 400 }
      );
    }

    if (body.status !== "approved" && body.status !== "rejected") {
      return NextResponse.json(
        { error: "Status deve ser 'approved' ou 'rejected'" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 1. Validate portal_token — ensure project exists
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("portal_token", body.token)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Token inválido ou projeto não encontrado" },
        { status: 404 }
      );
    }

    // 2. Validate task belongs to this project and requires approval
    const { data: task } = await supabase
      .from("os_tasks")
      .select("id, project_id, requires_client_approval")
      .eq("id", body.taskId)
      .single();

    if (!task || task.project_id !== project.id) {
      return NextResponse.json(
        { error: "Tarefa não encontrada neste projeto" },
        { status: 404 }
      );
    }

    if (!task.requires_client_approval) {
      return NextResponse.json(
        { error: "Esta tarefa não requer aprovação do cliente" },
        { status: 400 }
      );
    }

    // 3. Update approval fields
    const { error: updateError } = await supabase
      .from("os_tasks")
      .update({
        client_approval_status: body.status,
        client_approval_comment: body.comment ?? null,
        client_approval_at: new Date().toISOString(),
      } as never)
      .eq("id", body.taskId);

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao salvar aprovação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: body.status });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
