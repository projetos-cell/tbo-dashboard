import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface ProjectSummaryRequest {
  projectName: string;
  context: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    recentTasks: Array<{
      title: string;
      status: string;
      assignee: string | null;
      due_date: string | null;
    }>;
  };
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

    const body = (await request.json()) as ProjectSummaryRequest;
    const { projectName, context } = body;

    if (!projectName?.trim()) {
      return NextResponse.json(
        { error: "Nome do projeto obrigatorio" },
        { status: 400 }
      );
    }

    const progressPct =
      context.totalTasks > 0
        ? Math.round((context.completedTasks / context.totalTasks) * 100)
        : 0;

    const taskListSummary = context.recentTasks
      .slice(0, 15)
      .map(
        (t) =>
          `- "${t.title}" | ${t.status} | ${t.assignee ?? "sem responsavel"} | Prazo: ${t.due_date ?? "sem prazo"}`
      )
      .join("\n");

    const systemPrompt = `Voce e um gestor de projetos senior da agencia TBO.
Gere um status update narrativo e estrategico sobre o projeto.

Dados do projeto "${projectName}":
- Total: ${context.totalTasks} tarefas
- Concluidas: ${context.completedTasks} (${progressPct}%)
- Em andamento: ${context.inProgressTasks}
- Atrasadas: ${context.overdueTasks}

Tarefas:
${taskListSummary || "Nenhuma tarefa."}

Instrucoes:
- Escreva em portugues brasileiro
- Formato: 2-3 paragrafos curtos
- Tom profissional e direto
- Destaque riscos se houver tarefas atrasadas
- Sugira proximos passos
- Maximo 200 palavras`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Gere o status update narrativo deste projeto.",
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const summary =
      textBlock && "text" in textBlock ? textBlock.text : "Sem resumo.";

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
