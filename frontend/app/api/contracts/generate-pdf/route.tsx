import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";
import {
  TemplatePJ,
  TemplateNDA,
  TemplateFreelancer,
  TemplateCLT,
  TemplateGenerico,
} from "@/features/contratos/templates";
import type { ContractPdfData, ContractTemplateKey } from "@/features/contratos/templates";

// ─── Template router ──────────────────────────────────────────────────────────

function getTemplateComponent(
  template: ContractTemplateKey,
  data: ContractPdfData
): React.ReactElement {
  switch (template) {
    case "pj":
      return <TemplatePJ data={data} />;
    case "nda":
      return <TemplateNDA data={data} />;
    case "freelancer":
      return <TemplateFreelancer data={data} />;
    case "clt":
      return <TemplateCLT data={data} />;
    case "aditivo":
    case "generico":
    default:
      return <TemplateGenerico data={data} />;
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, data } = body as {
      template: ContractTemplateKey;
      data: ContractPdfData;
    };

    if (!data || !data.title) {
      return NextResponse.json(
        { error: "Dados do contrato sao obrigatorios" },
        { status: 400 }
      );
    }

    // Ensure signers array
    if (!data.signers || data.signers.length === 0) {
      data.signers = [
        { name: "___________________________", email: "", role: "signer" },
        { name: "___________________________", email: "", role: "signer" },
      ];
    }

    const templateKey: ContractTemplateKey = template || mapTypeToTemplate(data.type);
    const element = getTemplateComponent(templateKey, data);
    const buffer = await renderToBuffer(
      element as React.ReactElement<DocumentProps>
    );

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    const filename = data.contractNumber
      ? `${data.contractNumber}_${slug}.pdf`
      : `contrato_${slug}.pdf`;

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
    console.error("[generate-pdf] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapTypeToTemplate(type: string): ContractTemplateKey {
  const map: Record<string, ContractTemplateKey> = {
    pj: "pj",
    nda: "nda",
    freelancer: "freelancer",
    clt: "clt",
    aditivo: "aditivo",
  };
  return map[type] ?? "generico";
}
