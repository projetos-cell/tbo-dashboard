"use client";

import { useState } from "react";
import {
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBlogAiGenerate } from "../hooks/use-blog-ai-generate";

type Tone = "ruy" | "marco" | "tbo";

interface BlogAiGenerateDialogProps {
  onGenerated: (result: {
    title: string;
    excerpt: string;
    tags: string[];
    body: string;
  }) => void;
}

export function BlogAiGenerateDialog({ onGenerated }: BlogAiGenerateDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("tbo");
  const [instructions, setInstructions] = useState("");

  const generate = useBlogAiGenerate();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const result = await generate.mutateAsync({
      topic: topic.trim(),
      tone,
      additionalInstructions: instructions.trim() || undefined,
    });

    onGenerated(result);
    setOpen(false);
    setTopic("");
    setInstructions("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <IconSparkles className="h-4 w-4" />
          Gerar com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            Gerar artigo com IA
          </DialogTitle>
          <DialogDescription>
            O conteudo sera gerado com base nos posts do LinkedIn do Ruy e Marco,
            alem dos artigos ja publicados no blog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Topic */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tema do artigo</Label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Como a direção criativa impacta as vendas de um lancamento imobiliario"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tom de voz</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ruy">
                  Ruy Lima — Estrategia & Gestao
                </SelectItem>
                <SelectItem value="marco">
                  Marco Andolfato — Criativo & Visual
                </SelectItem>
                <SelectItem value="tbo">
                  TBO Institucional — Equilibrado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional instructions */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Instrucoes adicionais (opcional)
            </Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex: Mencionar o case do empreendimento X, focar em dados de mercado 2026..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || generate.isPending}
            className="w-full"
          >
            {generate.isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando artigo...
              </>
            ) : (
              <>
                <IconSparkles className="h-4 w-4 mr-2" />
                Gerar artigo
              </>
            )}
          </Button>

          {generate.isPending && (
            <p className="text-xs text-muted-foreground text-center">
              Isso pode levar alguns segundos. O conteudo sera inserido no editor automaticamente.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
