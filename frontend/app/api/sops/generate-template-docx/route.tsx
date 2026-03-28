import { NextRequest, NextResponse } from "next/server";
import {
  generateSOPDocx,
} from "@/features/conhecimento/templates/sop-template-docx";
import type { SOPTemplateData } from "@/features/conhecimento/templates/sop-content-parser";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as SOPTemplateData;

    if (!data.stepContent || !data.sopTitle) {
      return NextResponse.json(
        { error: "Dados do template sao obrigatorios" },
        { status: 400 }
      );
    }

    const buffer = await generateSOPDocx(data);

    const cleanTitle = data.stepTitle
      .replace(/^\d+\.\s*/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);

    const filename = `${data.sopSlug}-${cleanTitle}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao gerar DOCX";
    console.error("[sop-template-docx] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
