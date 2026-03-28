"use client";

import { IconTemplate } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROJECT_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
} from "@/features/projects/hooks/use-project-templates";

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
  const selectedTemplate = PROJECT_TEMPLATES.find(
    (t) => t.id === selectedTemplateId,
  );

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
              {PROJECT_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="mr-1.5">{t.icon}</span>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-[11px] text-muted-foreground">
              {selectedTemplate.sections.length} seções ·{" "}
              {selectedTemplate.sections.reduce(
                (sum, s) => sum + s.tasks.length,
                0,
              )}{" "}
              tarefas padrão — tudo zerado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
