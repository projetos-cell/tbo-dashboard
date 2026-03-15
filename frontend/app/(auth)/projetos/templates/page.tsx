"use client";

import { useState } from "react";
import {
  IconPlus,
  IconCheck,
  IconList,
  IconChevronRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES, type ProjectTemplate } from "@/features/projects/services/project-templates";
import { cn } from "@/lib/utils";

export default function ProjetosTemplatesPage() {
  const [previewTemplate, setPreviewTemplate] = useState<ProjectTemplate | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates de Projeto</h1>
          <p className="text-muted-foreground">
            Modelos pré-configurados com seções e tarefas para criar projetos rapidamente.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PROJECT_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onPreview={() => setPreviewTemplate(template)}
          />
        ))}
      </div>

      {/* Preview sheet */}
      <Sheet open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {previewTemplate && <TemplatePreview template={previewTemplate} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
}: {
  template: ProjectTemplate;
  onPreview: () => void;
}) {
  const totalTasks = template.sections.reduce((acc, s) => acc + s.tasks.length, 0);

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={onPreview}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {template.category}
              </Badge>
            </div>
          </div>
          <IconChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconList className="size-3" />
            {template.sections.length} seções
          </span>
          <span className="flex items-center gap-1">
            <IconCheck className="size-3" />
            {totalTasks} tarefas
          </span>
        </div>
        {/* Section color bar */}
        <div className="flex h-1 gap-0.5 rounded-full overflow-hidden">
          {template.sections.map((s) => (
            <div
              key={s.title}
              className="flex-1"
              style={{ backgroundColor: s.color }}
              title={s.title}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplatePreview({ template }: { template: ProjectTemplate }) {
  const router = useRouter();
  const totalTasks = template.sections.reduce((acc, s) => acc + s.tasks.length, 0);

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <span className="text-2xl">{template.icon}</span>
          {template.name}
        </SheetTitle>
      </SheetHeader>

      <div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
          <span>{template.sections.length} seções</span>
          <span>{totalTasks} tarefas</span>
          {template.construtora && <span>Construtora: {template.construtora}</span>}
        </div>
      </div>

      <div className="space-y-4">
        {template.sections.map((section) => (
          <div key={section.title} className="rounded-lg border">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: section.color }}
              />
              <span className="text-sm font-medium">{section.title}</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {section.tasks.length}
              </Badge>
            </div>
            <div className="divide-y">
              {section.tasks.map((task) => (
                <div key={task.title} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                  <div className="size-3.5 rounded border border-muted-foreground/30" />
                  <span className="flex-1 text-muted-foreground">{task.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1",
                      task.priority === "urgente" && "border-red-200 text-red-600",
                      task.priority === "alta" && "border-orange-200 text-orange-600",
                      task.priority === "media" && "border-yellow-200 text-yellow-600",
                      task.priority === "baixa" && "border-green-200 text-green-600",
                    )}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full gap-2"
        onClick={() => router.push(`/projetos?template=${template.id}`)}
      >
        <IconPlus className="size-4" />
        Usar Template
      </Button>
    </div>
  );
}
