"use client";

import { useState } from "react";
import {
  IconCheckbox,
  IconBell,
  IconChartBar,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ── Task dialog ──────────────────────────────────────────────────────────────

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: string;
  channelId?: string | null;
}

export function TaskFromMessageDialog({ open, onOpenChange, prefill = "" }: TaskDialogProps) {
  const [title, setTitle] = useState(prefill);
  const [dueDate, setDueDate] = useState("");

  function handleSubmit() {
    if (!title.trim()) return;
    // In a real integration this would call the tasks service
    toast.success(`Tarefa "${title.trim()}" criada com sucesso`);
    onOpenChange(false);
    setTitle("");
    setDueDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCheckbox size={18} className="text-primary" />
            Nova tarefa
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-xs">Título *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva a tarefa..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-due" className="text-xs">Prazo (opcional)</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!title.trim()}>
            Criar tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Reminder dialog ──────────────────────────────────────────────────────────

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: string;
}

export function ReminderDialog({ open, onOpenChange, prefill = "" }: ReminderDialogProps) {
  const [text, setText] = useState(prefill);
  const [remindAt, setRemindAt] = useState("");

  function handleSubmit() {
    if (!text.trim() || !remindAt) return;
    toast.success(`Lembrete "${text.trim()}" agendado`);
    onOpenChange(false);
    setText("");
    setRemindAt("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBell size={18} className="text-amber-500" />
            Novo lembrete
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="reminder-text" className="text-xs">Mensagem *</Label>
            <Input
              id="reminder-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Do que quer se lembrar?"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reminder-at" className="text-xs">Quando *</Label>
            <Input
              id="reminder-at"
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!text.trim() || !remindAt}>
            Criar lembrete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Poll dialog ───────────────────────────────────────────────────────────────

interface PollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (question: string, options: string[]) => void;
}

export function PollDialog({ open, onOpenChange, onSubmit }: PollDialogProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOption(idx: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  }

  const isValid = question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit(
      question.trim(),
      options.filter((o) => o.trim()),
    );
    onOpenChange(false);
    setQuestion("");
    setOptions(["", ""]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconChartBar size={18} className="text-violet-500" />
            Nova enquete
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="poll-question" className="text-xs">Pergunta *</Label>
            <Input
              id="poll-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="O que você quer perguntar?"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Opções * (mín. 2)</Label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Opção ${idx + 1}`}
                  className="h-8 text-sm"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeOption(idx)}
                  >
                    <IconTrash size={13} />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={addOption}
              >
                <IconPlus size={12} />
                Adicionar opção
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!isValid}>
            Criar enquete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
