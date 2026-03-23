import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface SubmitBody {
  token: string;
  tokenId: string;
  surveyId: string;
  answers: Record<string, string | string[]>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;

    if (!body.token || !body.surveyId || !body.answers) {
      return NextResponse.json(
        { error: "Campos obrigatórios: token, surveyId, answers" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Validate token exists and is unused
    const { data: tokenData, error: tokenError } = await (supabase
      .from("climate_survey_tokens" as never)
      .select("id, used, survey_id" as never)
      .eq("token" as never, body.token as never)
      .maybeSingle() as unknown as Promise<{
        data: { id: string; used: boolean; survey_id: string } | null;
        error: Error | null;
      }>);

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 404 }
      );
    }

    if (tokenData.used) {
      return NextResponse.json(
        { error: "Esta pesquisa já foi respondida com este link" },
        { status: 409 }
      );
    }

    // 2. Insert anonymous response (NO user/email reference)
    const { error: responseError } = await supabase
      .from("climate_survey_responses" as never)
      .insert({
        survey_id: body.surveyId,
        answers: body.answers,
      } as never);

    if (responseError) {
      console.error("Error inserting response:", responseError);
      return NextResponse.json(
        { error: "Erro ao salvar resposta" },
        { status: 500 }
      );
    }

    // 3. Mark token as used (separately from response — no link between them)
    await supabase
      .from("climate_survey_tokens" as never)
      .update({ used: true, used_at: new Date().toISOString() } as never)
      .eq("id" as never, tokenData.id as never);

    return NextResponse.json({
      success: true,
      message: "Pesquisa enviada com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
