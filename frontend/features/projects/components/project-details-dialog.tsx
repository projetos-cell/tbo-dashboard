"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import {
  PROJECT_STATUS,
  BU_LIST,
  BU_COLORS,
  type ProjectStatusKey,
} from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectDetailsDialogProps {
  project: ProjectRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const [name, setName] = useState(project.name);
  const [construtora, setConstrutora] = useState(project.construtora ?? "");
  const [ownerName, setOwnerName] = useState(project.owner_name ?? "");
  const [status, setStatus] = useState(project.status ?? "em_andamento");
  const [priority, setPriority] = useState(project.priority ?? "media");
  const [selectedBus, setSelectedBus] = useState<string[]>(parseBus(project.bus));
  const [dueDateStart, setDueDateStart] = useState(project.due_date_start ?? "");
  const [dueDateEnd, setDueDateEnd] = useState(project.due_date_end ?? "");
  const [value, setValue] = useState(project.value?.toString() ?? "");
  const [notionUrl, setNotionUrl] = useState(project.notion_url ?? "");
  const [notes, setNotes] = useState(project.notes ?? "");

  // Reset when project changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(project.name);
      setConstrutora(project.construtora ?? "");
      setOwnerName(project.owner_name ?? "");
      setStatus(project.status ?? "em_andamento");
      setPriority(project.priority ?? "media");
      setSelectedBus(parseBus(project.bus));
      setDueDateStart(project.due_date_start ?? "");
      setDueDateEnd(project.due_date_end ?? "");
      setValue(project.value?.toString() ?? "");
      setNotionUrl(project.notion_url ?? "");
      setNotes(project.notes ?? "");
    }
  }, [open, project]);

  function toggleBu(bu: string) {
    setSelectedBus((prev) =>
      prev.includes(bu) ? prev.filter((b) => b !== bu) : [...prev, bu]
    );
  }

  function handleSave() {
    if (!name.trim()) return;

    updateProject.mutate(
      {
        id: project.id,
        updates: {
          name: name.trim(),
          construtora: construtora.trim() || null,
          owner_name: ownerName.trim() || null,
          status,
          priority,
          bus: selectedBus.length ? JSON.stringify(selectedBus) : null,
          due_date_start: dueDateStart || null,
          due_date_end: dueDateEnd || null,
          value: value ? parseFloat(value) : null,
          notion_url: notionUrl.trim() || null,
          notes: notes.trim() || null,
        } as never,
      },
      {
        onSuccess: () => {
          toast({ title: "Projeto atualizado" });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Erro ao atualizar", variant: "destructive" });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar detalhes do projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Código (read-only) */}
          {project.code && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Código</Label>
              <p className="font-mono text-sm font-medium">{project.code}</p>
            </div>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Projeto *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do projeto"
            />
          </div>

          {/* Status + Prioridade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BU */}
          <div className="space-y-2">
            <Label>Unidades de Negócio</Label>
            <div className="flex flex-wrap gap-2">
              {BU_LIST.map((bu) => {
                const isSelected = selectedBus.includes(bu);
                const buStyle = BU_COLORS[bu];
                return (
                  <Badge
                    key={bu}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none transition-colors",
                      !isSelected && "hover:bg-accent"
                    )}
                    style={
                      isSelected && buStyle
                        ? { backgroundColor: buStyle.color, color: "#fff", borderColor: "transparent" }
                        : undefined
                    }
                    onClick={() => toggleBu(bu)}
                  >
                    {bu}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Construtora + Responsável */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-construtora">Construtora</Label>
              <Input
                id="edit-construtora"
                value={construtora}
                onChange={(e) => setConstrutora(e.target.value)}
                placeholder="Ex: MRV"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-owner">Responsável</Label>
              <Input
                id="edit-owner"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Data Início</Label>
              <Input
                id="edit-start"
                type="date"
                value={dueDateStart}
                onChange={(e) => setDueDateStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">Data Entrega</Label>
              <Input
                id="edit-end"
                type="date"
                value={dueDateEnd}
                onChange={(e) => setDueDateEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="edit-value">Valor (R$)</Label>
            <Input
              id="edit-value"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0,00"
            />
          </div>

          {/* Notion URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-notion">URL Notion</Label>
            <Input
              id="edit-notion"
              type="url"
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              placeholder="https://notion.so/..."
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notas</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o projeto..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || updateProject.isPending}
            style={{ backgroundColor: "#e85102", borderColor: "#e85102" }}
          >
            {updateProject.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
