import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractAssistRequest {
  /** What to generate: object, scope, payment, full */
  action: "object" | "scope" | "payment" | "full" | "review";
  /** Contract context */
  context: {
    title: string;
    description?: string | null;
    category: string;
    type: string;
    totalValue: number;
    scopeItems?: Array<{ title: string; description?: string | null; value: number }>;
    signers?: Array<{ name: string; role: string }>;
    projectName?: string;
    startDate?: string | null;
    endDate?: string | null;
  };
  /** Additional user instructions */
  instructions?: string;
}

interface ContractAssistResponse {
  objectClause?: string;
  scopeDetails?: string;
  paymentStructure?: string;
  suggestions?: string[];
  reviewNotes?: string;
}

// ─── System prompts ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Voce e o assistente juridico da TBO, uma agencia de comunicacao, publicidade e 3D de Curitiba/PR.

Seu papel e ajudar a redigir clausulas e termos para contratos de prestacao de servicos.

REGRAS:
- Escreva em portugues formal juridico, sem acentos (padrao de documentos digitais)
- Use linguagem direta e objetiva
- Nao invente dados (CNPJ, CPF, enderecos) — use placeholders se necessario
- Baseie-se na estrutura: CONTRATANTE (quem contrata) e CONTRATADO (quem presta o servico)
- A TBO normalmente e a CONTRATADA (presta servicos) quando categoria = "cliente"
- A TBO normalmente e a CONTRATANTE quando categoria = "equipe" ou "fornecedor"
- Considere LGPD (Lei 13.709/2018) para confidencialidade
- Considere Lei 9.610/98 para direitos autorais
- Considere Decreto 57.690/66 para publicidade
- Multa padrao rescisoria: 20%
- Multa por atraso: 10% + 1% juros ao mes
- Limite de revisoes: 3 por entrega
- Foro: Curitiba/PR
- Contrato nao-exclusivo por padrao
- Responda APENAS com o texto solicitado, sem explicacoes ou markdown`;

function buildUserPrompt(req: ContractAssistRequest): string {
  const { action, context, instructions } = req;
  const ctx = [
    `Titulo: ${context.title}`,
    context.description ? `Descricao: ${context.description}` : null,
    `Categoria: ${context.category}`,
    `Tipo: ${context.type}`,
    `Valor total: R$ ${context.totalValue.toLocaleString("pt-BR")}`,
    context.projectName ? `Empreendimento/Projeto: ${context.projectName}` : null,
    context.startDate ? `Inicio: ${context.startDate}` : null,
    context.endDate ? `Termino: ${context.endDate}` : null,
    context.scopeItems?.length
      ? `Escopo:\n${context.scopeItems.map((i, idx) => `  ${idx + 1}. ${i.title} - R$ ${i.value.toLocaleString("pt-BR")}`).join("\n")}`
      : null,
    context.signers?.length
      ? `Signatarios: ${context.signers.map((s) => `${s.name} (${s.role})`).join(", ")}`
      : null,
    instructions ? `\nInstrucoes adicionais: ${instructions}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  switch (action) {
    case "object":
      return `Com base no contexto abaixo, redija a clausula de OBJETO DO CONTRATO (clausula 1.1).
Descreva de forma precisa os servicos que serao prestados.

${ctx}`;

    case "scope":
      return `Com base no contexto abaixo, detalhe o ESCOPO DE SERVICOS formatado como lista com letras (a, b, c...).
Cada item deve ser claro e mensuravel.

${ctx}`;

    case "payment":
      return `Com base no contexto abaixo, sugira uma ESTRUTURA DE PAGAMENTO detalhada.
Inclua: numero de parcelas, valores, datas relativas, condicoes.
Formato: texto corrido para clausula contratual.

${ctx}`;

    case "full":
      return `Com base no contexto abaixo, gere 3 blocos separados por "---":
1. OBJETO: clausula 1.1 do contrato
2. ESCOPO: lista detalhada com letras (a, b, c...)
3. PAGAMENTO: estrutura de parcelas e condicoes

${ctx}`;

    case "review":
      return `Revise o contrato abaixo e sugira melhorias. Liste ate 5 pontos de atencao, riscos ou clausulas que poderiam ser mais robustas.

${ctx}`;

    default:
      return ctx;
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY nao configurada" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as ContractAssistRequest;
    const { action, context } = body;

    if (!context?.title) {
      return NextResponse.json(
        { error: "Titulo do contrato e obrigatorio" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(body) },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const result: ContractAssistResponse = {};

    if (action === "full") {
      const parts = text.split("---").map((p) => p.trim());
      result.objectClause = parts[0] ?? "";
      result.scopeDetails = parts[1] ?? "";
      result.paymentStructure = parts[2] ?? "";
    } else if (action === "object") {
      result.objectClause = text;
    } else if (action === "scope") {
      result.scopeDetails = text;
    } else if (action === "payment") {
      result.paymentStructure = text;
    } else if (action === "review") {
      result.reviewNotes = text;
      result.suggestions = text
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\./))
        .map((line) => line.trim());
    }

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro no assistente de contratos";
    console.error("[contract-assist] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
