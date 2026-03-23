import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST() {
  try {
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

    // Create anonymous token — no email, no user data
    const { data: newToken } = await (supabase
      .from("climate_survey_tokens")
      .insert({
        survey_id: survey.id,
        email: "anonymous",
      })
      .select("token")
      .single() as unknown as Promise<{ data: { token: string } | null }>);

    if (!newToken) {
      return NextResponse.json(
        { error: "Erro ao iniciar pesquisa. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: newToken.token });
  } catch {
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
