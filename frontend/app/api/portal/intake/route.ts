import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface IntakeSubmission {
  token: string;
  fields: Record<string, string>;
}

interface IntakeFormData {
  id: string;
  project_id: string;
  tenant_id: string;
  fields_json: unknown;
  target_section_id: string | null;
  default_status: string | null;
  default_priority: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IntakeSubmission;

    if (!body.token || !body.fields) {
      return NextResponse.json(
        { error: "Campos obrigatórios: token, fields" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Find intake form by token
    const { data: form, error: formError } = await (supabase
      .from("intake_forms" as never)
      .select("*" as never)
      .eq("token" as never, body.token as never)
      .eq("is_active" as never, true as never)
      .maybeSingle() as unknown as Promise<{ data: IntakeFormData | null; error: Error | null }>);

    if (formError || !form) {
      return NextResponse.json(
        { error: "Formulário não encontrado ou inativo" },
        { status: 404 }
      );
    }

    // Validate required fields
    const fieldsConfig = (form.fields_json ?? []) as Array<{
      key: string;
      label: string;
      type: string;
      required: boolean;
    }>;

    for (const field of fieldsConfig) {
      if (field.required && !body.fields[field.key]?.trim()) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field.label}` },
          { status: 400 }
        );
      }
    }

    const title = body.fields.title || "Solicitação via Intake";
    const description = body.fields.description || null;

    // Build description with all extra fields
    const extraFields = Object.entries(body.fields)
      .filter(([key]) => key !== "title" && key !== "description")
      .map(([key, value]) => {
        const fieldConfig = fieldsConfig.find((f) => f.key === key);
        return `**${fieldConfig?.label ?? key}:** ${value}`;
      })
      .join("\n");

    const fullDescription = [description, extraFields]
      .filter(Boolean)
      .join("\n\n---\n\n");

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from("os_tasks")
      .insert({
        project_id: form.project_id,
        tenant_id: form.tenant_id,
        section_id: form.target_section_id,
        title,
        description: fullDescription || null,
        status: form.default_status ?? "pendente",
        priority: form.default_priority,
        order_index: 999999,
        is_completed: false,
      } as never)
      .select("id,title")
      .single();

    if (taskError) {
      return NextResponse.json(
        { error: "Erro ao criar tarefa" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      taskId: task.id,
      message: "Solicitação enviada com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
