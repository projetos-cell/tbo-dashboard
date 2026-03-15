import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface SmartTaskRequest {
  rawInput: string;
}

interface SmartTaskResponse {
  title: string;
  subtasks: string[];
  estimatedHours: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SmartTaskRequest;
    const { rawInput } = body;

    if (!rawInput?.trim()) {
      return NextResponse.json(
        { error: "Input obrigatorio" },
        { status: 400 }
      );
    }

    const systemPrompt = `Voce e um assistente de gestao de projetos de uma agencia de publicidade.
Dada uma descricao longa de tarefa, extraia:
1. Um titulo limpo e curto (max 60 chars)
2. De 2 a 5 subtarefas praticas
3. Estimativa de horas (numero inteiro ou null se impossivel estimar)

Responda APENAS com JSON valido neste formato exato:
{"title":"Titulo limpo","subtasks":["Sub 1","Sub 2"],"estimatedHours":4}

Regras:
- Titulo deve ser claro e conciso
- Subtarefas devem ser acionaveis
- Estimativa realista para agencia de publicidade
- Sem explicacoes adicionais`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: rawInput }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

    let result: SmartTaskResponse = {
      title: rawInput.slice(0, 60),
      subtasks: [],
      estimatedHours: null,
    };

    try {
      const parsed = JSON.parse(raw) as Partial<SmartTaskResponse>;
      if (parsed.title) result.title = parsed.title;
      if (Array.isArray(parsed.subtasks)) {
        result.subtasks = parsed.subtasks.filter(
          (s): s is string => typeof s === "string"
        );
      }
      if (typeof parsed.estimatedHours === "number") {
        result.estimatedHours = parsed.estimatedHours;
      }
    } catch {
      // Keep defaults
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
