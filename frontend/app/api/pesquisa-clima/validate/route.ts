import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface TokenData {
  id: string;
  survey_id: string;
  used: boolean;
  climate_surveys: {
    id: string;
    title: string;
    is_active: boolean;
  };
}

function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, status: "invalid" });
  }

  try {
    const supabase = getPublicSupabase();

    const { data } = await (supabase
      .from("climate_survey_tokens" as never)
      .select("id, survey_id, used, climate_surveys(id, title, is_active)" as never)
      .eq("token" as never, token as never)
      .maybeSingle() as unknown as Promise<{ data: TokenData | null }>);

    if (!data) {
      return NextResponse.json({ valid: false, status: "invalid" });
    }

    if (!data.climate_surveys?.is_active) {
      return NextResponse.json({ valid: false, status: "closed" });
    }

    if (data.used) {
      return NextResponse.json({ valid: false, status: "used" });
    }

    return NextResponse.json({
      valid: true,
      status: "ok",
      tokenId: data.id,
      surveyId: data.survey_id,
      surveyTitle: data.climate_surveys.title,
    });
  } catch {
    return NextResponse.json({ valid: false, status: "invalid" });
  }
}
