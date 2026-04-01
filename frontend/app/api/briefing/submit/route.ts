import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

// Tenant padrão da TBO (usar o mesmo de outros módulos)
const TBO_TENANT_ID = process.env.TBO_DEFAULT_TENANT_ID || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, clientName, projectSlug, projectName, formData, briefingId } =
      body as {
        slug: string;
        clientName: string;
        projectSlug?: string;
        projectName?: string;
        formData: Record<string, unknown>;
        briefingId?: string;
      };

    if (!slug || !formData) {
      return NextResponse.json(
        { error: "slug e formData são obrigatórios" },
        { status: 400 },
      );
    }

    // Validar campos obrigatórios
    const required = [
      "nome_empreendimento",
      "incorporadora",
      "persona_principal",
      "diferencial_principal",
    ];
    const missing = required.filter(
      (f) => !formData[f] || !(formData[f] as string).toString().trim(),
    );
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Buscar tenant_id — usar variável de ambiente ou buscar do banco
    let tenantId = TBO_TENANT_ID;
    if (!tenantId) {
      const { data: tenant } = await (supabase
        .from("tenants" as never)
        .select("id" as never)
        .limit(1)
        .single() as unknown as Promise<{ data: { id: string } | null }>);
      tenantId = tenant?.id || "";
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não configurado" },
        { status: 500 },
      );
    }

    const now = new Date().toISOString();

    if (briefingId) {
      // Atualizar existente
      const { error } = await (supabase
        .from("creative_briefings" as never)
        .update({
          form_data: formData,
          status: "enviado",
          submitted_at: now,
          updated_at: now,
          client_name: clientName,
          project_name: projectName || null,
        } as never)
        .eq("id" as never, briefingId as never) as unknown as Promise<{
        error: { message: string } | null;
      }>);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Criar novo
      const { error } = await (supabase
        .from("creative_briefings" as never)
        .insert({
          tenant_id: tenantId,
          slug,
          client_name: clientName,
          project_slug: projectSlug || null,
          project_name: projectName || null,
          form_data: formData,
          status: "enviado",
          submitted_at: now,
          is_active: true,
        } as never) as unknown as Promise<{
        error: { message: string } | null;
      }>);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Auto-save endpoint (rascunho)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slug, clientName, projectSlug, projectName, formData, briefingId } =
      body as {
        slug: string;
        clientName: string;
        projectSlug?: string;
        projectName?: string;
        formData: Record<string, unknown>;
        briefingId?: string;
      };

    if (!slug || !formData) {
      return NextResponse.json(
        { error: "slug e formData são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    let tenantId = TBO_TENANT_ID;
    if (!tenantId) {
      const { data: tenant } = await (supabase
        .from("tenants" as never)
        .select("id" as never)
        .limit(1)
        .single() as unknown as Promise<{ data: { id: string } | null }>);
      tenantId = tenant?.id || "";
    }

    const now = new Date().toISOString();

    if (briefingId) {
      await (supabase
        .from("creative_briefings" as never)
        .update({
          form_data: formData,
          updated_at: now,
        } as never)
        .eq("id" as never, briefingId as never) as unknown as Promise<{
        error: unknown;
      }>);
    } else {
      // Upsert como rascunho
      await (supabase.from("creative_briefings" as never).upsert(
        {
          tenant_id: tenantId,
          slug,
          client_name: clientName,
          project_slug: projectSlug || null,
          project_name: projectName || null,
          form_data: formData,
          status: "rascunho",
          is_active: true,
          updated_at: now,
        } as never,
        { onConflict: "tenant_id,slug,project_slug" as never },
      ) as unknown as Promise<{ error: unknown }>);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao salvar rascunho" },
      { status: 500 },
    );
  }
}
