import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(null, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data } = await (supabase
      .from("creative_briefings" as never)
      .select("id, form_data, status" as never)
      .eq("slug" as never, slug as never)
      .eq("is_active" as never, true as never)
      .eq("status" as never, "rascunho" as never)
      .order("created_at" as never, { ascending: false } as never)
      .limit(1)
      .maybeSingle() as unknown as Promise<{
      data: { id: string; form_data: unknown; status: string } | null;
    }>);

    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
