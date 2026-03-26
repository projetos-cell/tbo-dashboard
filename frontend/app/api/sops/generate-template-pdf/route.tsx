import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";
import {
  SOPTemplatePdf,
  type SOPTemplatePdfData,
} from "@/features/conhecimento/templates/sop-template-pdf";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as SOPTemplatePdfData;

    if (!data.stepContent || !data.sopTitle) {
      return NextResponse.json(
        { error: "Dados do template sao obrigatorios" },
        { status: 400 }
      );
    }

    const element = <SOPTemplatePdf data={data} />;
    const buffer = await renderToBuffer(
      element as React.ReactElement<DocumentProps>
    );

    const cleanTitle = data.stepTitle
      .replace(/^\d+\.\s*/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);

    const filename = `${data.sopSlug}-${cleanTitle}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar PDF";
    console.error("[sop-template-pdf] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
