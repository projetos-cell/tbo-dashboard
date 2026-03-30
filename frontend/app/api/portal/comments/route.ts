import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token obrigatorio" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("portal_token", token)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Token invalido" },
        { status: 404 },
      );
    }

    const { data: comments, error } = await (
      supabase as unknown as { from: (name: string) => ReturnType<typeof supabase.from> }
    ).from("portal_comments")
      .select("id, author_name, author_email, content, is_internal, created_at")
      .eq("project_id", project.id)
      .eq("is_internal", false)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments: comments ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

interface CommentBody {
  token: string;
  author_name: string;
  author_email?: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CommentBody;

    if (!body.token || !body.author_name?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Campos obrigatorios: token, author_name, content" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: project } = await supabase
      .from("projects")
      .select("id, tenant_id")
      .eq("portal_token", body.token)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Token invalido" },
        { status: 404 },
      );
    }

    const { data: comment, error } = await (
      supabase as unknown as { from: (name: string) => ReturnType<typeof supabase.from> }
    ).from("portal_comments")
      .insert({
        tenant_id: project.tenant_id,
        project_id: project.id,
        author_name: body.author_name.trim(),
        author_email: body.author_email?.trim() ?? "",
        content: body.content.trim(),
        is_internal: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json(
      { error: "Erro ao salvar comentario" },
      { status: 500 },
    );
  }
}
