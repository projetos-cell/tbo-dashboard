"use client";

import {
  IconSettings,
  IconPalette,
  IconFlag,
  IconTemplate,
  IconBell,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PropertyEditor } from "@/features/projects/components/property-editor";
import { usePropertyOptions } from "@/features/projects/hooks/use-project-properties";
import { RequireRole } from "@/features/auth/components/require-role";

function StatusSection() {
  const { data: statusOptions } = usePropertyOptions("status");
  const count = statusOptions?.length ?? 0;

  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconPalette className="size-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <p className="text-xs text-muted-foreground">{count} status configurados</p>
          </div>
        </div>
        <PropertyEditor
          property="status"
          trigger={
            <Button variant="outline" size="sm" className="text-xs">
              Gerenciar
            </Button>
          }
        />
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {statusOptions?.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: opt.bg, color: opt.color }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: opt.color }} />
            {opt.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function PrioritySection() {
  const { data: priorityOptions } = usePropertyOptions("priority");
  const count = priorityOptions?.length ?? 0;

  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconFlag className="size-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium">Prioridades</h3>
            <p className="text-xs text-muted-foreground">{count} prioridades configuradas</p>
          </div>
        </div>
        <PropertyEditor
          property="priority"
          trigger={
            <Button variant="outline" size="sm" className="text-xs">
              Gerenciar
            </Button>
          }
        />
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {priorityOptions?.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: opt.bg, color: opt.color }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: opt.color }} />
            {opt.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TemplatesSection() {
  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconTemplate className="size-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium">Templates</h3>
            <p className="text-xs text-muted-foreground">Modelos de projeto disponíveis</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <a href="/projetos/templates">Ver templates</a>
        </Button>
      </div>
      <div className="px-4 py-3 text-xs text-muted-foreground">
        Gerencie os templates de projeto na página de templates.
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconBell className="size-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium">Notificações</h3>
            <p className="text-xs text-muted-foreground">Configurações de notificação do módulo</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 px-4 py-3 text-xs text-muted-foreground">
        <p>Notificações de tarefas atrasadas, menções e atualizações de status serão enviadas automaticamente.</p>
      </div>
    </div>
  );
}

export default function ProjetosConfiguracoes() {
  return (
    <RequireRole module="projetos" allowed={["admin", "lider"]}>
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <IconSettings className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações do Módulo</h1>
          <p className="text-sm text-muted-foreground">
            Configure status, prioridades e preferências globais de projetos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusSection />
        <PrioritySection />
        <TemplatesSection />
        <NotificationsSection />
      </div>
    </div>
    </RequireRole>
  );
}
