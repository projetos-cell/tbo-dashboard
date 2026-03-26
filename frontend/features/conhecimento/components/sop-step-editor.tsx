"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconCheck, IconX, IconGripVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateSopStep } from "../hooks/use-sops";
import type { SOPStep, SOPStepType, SOPStepUpdate } from "../types/sops";

const STEP_TYPE_LABELS: Record<SOPStepType, string> = {
  step: "Passo",
  warning: "Alerta",
  tip: "Dica",
  note: "Nota",
  checkpoint: "Checklist",
};

interface SOPStepEditorProps {
  step: SOPStep;
  sopId: string;
}

export function SOPStepEditor({ step, sopId }: SOPStepEditorProps) {
  const [title, setTitle] = useState(step.title);
  const [content, setContent] = useState(step.content ?? "");
  const [stepType, setStepType] = useState<SOPStepType>(step.step_type);
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateStep = useUpdateSopStep();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Track dirty state
  useEffect(() => {
    const changed =
      title !== step.title ||
      content !== (step.content ?? "") ||
      stepType !== step.step_type;
    setIsDirty(changed);
  }, [title, content, stepType, step]);

  const handleSave = useCallback(() => {
    if (!isDirty) return;
    const updates: SOPStepUpdate = {};
    if (title !== step.title) updates.title = title;
    if (content !== (step.content ?? "")) updates.content = content;
    if (stepType !== step.step_type) updates.step_type = stepType;

    updateStep.mutate({ id: step.id, sopId, updates });
  }, [isDirty, title, content, stepType, step, sopId, updateStep]);

  const handleDiscard = useCallback(() => {
    setTitle(step.title);
    setContent(step.content ?? "");
    setStepType(step.step_type);
  }, [step]);

  return (
    <div className="group relative rounded-lg border border-border/60 bg-background p-3 space-y-2 hover:border-border transition-colors">
      <div className="flex items-center gap-2">
        <IconGripVertical className="size-4 text-muted-foreground/40 shrink-0 cursor-grab" />

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm font-medium flex-1"
          placeholder="Título da seção"
        />

        <Select
          value={stepType}
          onValueChange={(v) => setStepType(v as SOPStepType)}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STEP_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] text-sm font-mono leading-relaxed resize-none"
        placeholder="Conteúdo da seção (markdown)"
      />

      {isDirty && (
        <div className="flex items-center gap-2 justify-end pt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDiscard}
            className="h-7 text-xs"
          >
            <IconX className="size-3 mr-1" />
            Descartar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateStep.isPending}
            className="h-7 text-xs"
          >
            <IconCheck className="size-3 mr-1" />
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
}
