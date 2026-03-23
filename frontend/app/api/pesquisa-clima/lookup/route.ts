import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface LookupBody {
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookupBody;
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.endsWith("@agenciatbo.com.br")) {
      return NextResponse.json(
        { error: "Use seu e-mail @agenciatbo.com.br" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Find active survey
    const { data: survey } = await (supabase
      .from("climate_surveys")
      .select("id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as unknown as Promise<{ data: { id: string } | null }>);

    if (!survey) {
      return NextResponse.json(
        { error: "Nenhuma pesquisa ativa no momento." },
        { status: 404 }
      );
    }

    // Check if token already exists for this email
    const { data: existing } = await (supabase
      .from("climate_survey_tokens")
      .select("token, used")
      .eq("survey_id", survey.id)
      .eq("email", email)
      .maybeSingle() as unknown as Promise<{ data: { token: string; used: boolean } | null }>);

    if (existing) {
      if (existing.used) {
        return NextResponse.json({ status: "used" });
      }
      return NextResponse.json({ token: existing.token, status: "ok" });
    }

    // Create new token for this email
    const { data: newToken } = await (supabase
      .from("climate_survey_tokens")
      .insert({ survey_id: survey.id, email })
      .select("token")
      .single() as unknown as Promise<{ data: { token: string } | null }>);

    if (!newToken) {
      return NextResponse.json(
        { error: "Erro ao gerar acesso. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: newToken.token, status: "ok" });
  } catch {
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
