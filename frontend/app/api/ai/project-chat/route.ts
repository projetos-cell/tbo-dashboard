import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface RecentTask {
  title: string;
  status: string;
  assignee: string | null;
  due_date: string | null;
}

interface ProjectChatRequest {
  projectId: string;
  projectName: string;
  question: string;
  context: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    recentTasks: RecentTask[];
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

    const body = (await request.json()) as ProjectChatRequest;
    const { projectName, question, context } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { error: "Pergunta obrigatoria" },
        { status: 400 }
      );
    }

    const taskListSummary = context.recentTasks
      .slice(0, 15)
      .map(
        (t) =>
          `- "${t.title}" | Status: ${t.status} | Responsavel: ${t.assignee ?? "sem responsavel"} | Prazo: ${t.due_date ?? "sem prazo"}`
      )
      .join("\n");

    const systemPrompt = `Voce e um assistente de gestao de projetos da agencia TBO. Responda em portugues brasileiro de forma direta e estrategica.

Dados do projeto "${projectName}":
- Total de tarefas: ${context.totalTasks}
- Concluidas: ${context.completedTasks} (${context.totalTasks > 0 ? Math.round((context.completedTasks / context.totalTasks) * 100) : 0}%)
- Em andamento: ${context.inProgressTasks}
- Atrasadas: ${context.overdueTasks}

Tarefas recentes:
${taskListSummary || "Nenhuma tarefa cadastrada."}

Responda de forma concisa, com insights acionaveis. Use bullet points quando apropriado.`;

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const answer = textBlock && "text" in textBlock ? textBlock.text : "Sem resposta.";

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
