"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { IconSparkles, IconSend } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";

// ─── Types ──────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProjectAiSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

const SUGGESTED_QUESTIONS = [
  "Qual o status geral?",
  "Quais tasks estao atrasadas?",
  "Sugestoes para acelerar?",
];

// ─── Component ──────────────────────────────────────────────────

export function ProjectAiSheet({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ProjectAiSheetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { allTasks } = useProjectTasks(projectId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus textarea when sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open]);

  const buildContext = useCallback(() => {
    const now = new Date();
    let completedTasks = 0;
    let overdueTasks = 0;
    let inProgressTasks = 0;

    const recentTasks = (allTasks ?? []).slice(0, 15).map((t) => {
      if (t.is_completed) completedTasks++;
      if (t.status === "em_andamento") inProgressTasks++;
      if (t.due_date && new Date(t.due_date) < now && !t.is_completed) overdueTasks++;

      return {
        title: t.title ?? "",
        status: t.status ?? "pendente",
        assignee: t.assignee_name ?? null,
        due_date: t.due_date ?? null,
      };
    });

    // Count all tasks (not just first 15)
    const all = allTasks ?? [];
    const totalTasks = all.length;
    const allCompleted = all.filter((t) => t.is_completed).length;
    const allInProgress = all.filter((t) => t.status === "em_andamento").length;
    const allOverdue = all.filter(
      (t) => t.due_date && new Date(t.due_date) < now && !t.is_completed
    ).length;

    return {
      totalTasks,
      completedTasks: allCompleted,
      overdueTasks: allOverdue,
      inProgressTasks: allInProgress,
      recentTasks,
    };
  }, [allTasks]);

  const handleSend = useCallback(
    async (question?: string) => {
      const text = (question ?? input).trim();
      if (!text || loading) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setLoading(true);

      try {
        const res = await fetch("/api/ai/project-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            projectName,
            question: text,
            context: buildContext(),
          }),
        });

        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errorData.error ?? "Erro ao consultar IA");
        }

        const data = (await res.json()) as { answer: string };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Erro inesperado";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Erro: ${errorMsg}` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, projectId, projectName, buildContext]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-[420px] flex-col sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <IconSparkles className="size-4 text-amber-500" />
            Ask AI
          </SheetTitle>
          <SheetDescription>
            Pergunte qualquer coisa sobre o projeto
          </SheetDescription>
        </SheetHeader>

        {/* ── Chat area ────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-1 py-2"
        >
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-4 pt-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
                <IconSparkles className="size-6 text-amber-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Como posso ajudar com {projectName}?
                </p>
                <p className="text-xs text-muted-foreground">
                  Pergunte sobre status, tarefas atrasadas, sugestoes e mais.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={`msg-${i}-${msg.role}`}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* ── Input area ───────────────────────────────────── */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo sobre o projeto..."
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              rows={1}
              disabled={loading}
            />
            <Button
              size="icon"
              className="size-9 shrink-0"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{ backgroundColor: "#e85102", borderColor: "#e85102" }}
            >
              <IconSend className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
