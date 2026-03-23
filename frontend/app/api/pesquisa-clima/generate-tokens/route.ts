import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

interface GenerateBody {
  surveyId: string;
  emails: string[];
}

export async function POST(request: Request) {
  try {
    // Auth check — only founder/diretoria
    const userSupabase = await createServerSupabase();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await request.json()) as GenerateBody;

    if (!body.surveyId || !body.emails?.length) {
      return NextResponse.json(
        { error: "Campos obrigatórios: surveyId, emails" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Generate tokens for each email (upsert to avoid duplicates)
    const tokens: Array<{ email: string; token: string; url: string }> = [];

    for (const email of body.emails) {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if token already exists
      const { data: existing } = await (supabase
        .from("climate_survey_tokens" as never)
        .select("token" as never)
        .eq("survey_id" as never, body.surveyId as never)
        .eq("email" as never, normalizedEmail as never)
        .maybeSingle() as unknown as Promise<{ data: { token: string } | null }>);

      if (existing) {
        tokens.push({
          email: normalizedEmail,
          token: existing.token,
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://os.agenciatbo.com.br"}/pesquisa-clima/${existing.token}`,
        });
        continue;
      }

      // Create new token
      const { data: newToken } = await (supabase
        .from("climate_survey_tokens" as never)
        .insert({
          survey_id: body.surveyId,
          email: normalizedEmail,
        } as never)
        .select("token" as never)
        .single() as unknown as Promise<{ data: { token: string } | null }>);

      if (newToken) {
        tokens.push({
          email: normalizedEmail,
          token: newToken.token,
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://os.agenciatbo.com.br"}/pesquisa-clima/${newToken.token}`,
        });
      }
    }

    return NextResponse.json({ success: true, tokens });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
