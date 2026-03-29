"use client";

import { IconTemplate, IconPencil } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROJECT_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  useSavedTemplates,
} from "@/features/projects/hooks/use-project-templates";
import type { TemplateSection } from "@/features/projects/services/project-templates";

interface TemplateSelectorProps {
  useTemplate: boolean;
  onUseTemplateChange: (value: boolean) => void;
  selectedTemplateId: string;
  onSelectedTemplateIdChange: (value: string) => void;
}

export { DEFAULT_TEMPLATE_ID };

export function TemplateSelector({
  useTemplate,
  onUseTemplateChange,
  selectedTemplateId,
  onSelectedTemplateIdChange,
}: TemplateSelectorProps) {
  const { data: savedTemplates } = useSavedTemplates();

  const selectedBuiltIn = PROJECT_TEMPLATES.find(
    (t) => t.id === selectedTemplateId,
  );
  const selectedSaved = savedTemplates?.find(
    (t) => t.id === selectedTemplateId,
  );

  const sectionCount = selectedBuiltIn
    ? selectedBuiltIn.sections.length
    : selectedSaved
      ? selectedSaved.sections_json.length
      : 0;

  const taskCount = selectedBuiltIn
    ? selectedBuiltIn.sections.reduce((s, sec) => s + sec.tasks.length, 0)
    : selectedSaved
      ? (selectedSaved.sections_json as TemplateSection[]).reduce((s, sec) => s + sec.tasks.length, 0)
      : 0;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTemplate className="size-4 text-muted-foreground" />
          <Label
            className="cursor-pointer text-sm font-medium"
            htmlFor="use-template"
          >
            Usar template de seções
          </Label>
        </div>
        <Switch
          id="use-template"
          checked={useTemplate}
          onCheckedChange={onUseTemplateChange}
        />
      </div>

      {useTemplate && (
        <div className="space-y-1.5">
          <Select
            value={selectedTemplateId}
            onValueChange={onSelectedTemplateIdChange}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-[10px] uppercase tracking-wider">Templates padrão</SelectLabel>
                {PROJECT_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="mr-1.5">{t.icon}</span>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              {savedTemplates && savedTemplates.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider">Templates salvos</SelectLabel>
                  {savedTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <IconPencil className="mr-1.5 inline size-3 text-muted-foreground" />
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
          {(selectedBuiltIn || selectedSaved) && (
            <p className="text-[11px] text-muted-foreground">
              {sectionCount} seções · {taskCount} tarefas padrão
            </p>
          )}
        </div>
      )}
    </div>
  );
}
