import { createServiceClient } from "@/lib/supabase/service";
import { IntakeFormView } from "./intake-form-view";
import type { IntakeFormRow } from "@/features/projects/services/intake-forms";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function IntakePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Fetch intake form by token (service client bypasses RLS)
  const { data: form } = await (supabase
    .from("intake_forms" as never)
    .select("*" as never)
    .eq("token" as never, token as never)
    .eq("is_active" as never, true as never)
    .maybeSingle() as unknown as Promise<{ data: Record<string, unknown> | null }>);

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Formulário não encontrado</h1>
          <p className="text-muted-foreground">
            Este link pode ter expirado ou o formulário foi desativado.
          </p>
        </div>
      </div>
    );
  }

  // Get project name
  const { data: project } = await (supabase
    .from("projects" as never)
    .select("name" as never)
    .eq("id" as never, (form.project_id as string) as never)
    .single() as unknown as Promise<{ data: { name: string } | null }>);

  return (
    <IntakeFormView
      form={form as unknown as IntakeFormRow}
      projectName={project?.name ?? "Projeto"}
      token={token}
    />
  );
}
