"use client";

import { useState } from "react";
import {
  IconClipboardText,
  IconPlus,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useIntakeForm,
  useCreateIntakeForm,
  useUpdateIntakeForm,
} from "@/features/projects/hooks/use-intake-forms";
import { useProjectSections } from "@/features/projects/hooks/use-project-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";

interface SettingsIntakeFormProps {
  projectId: string;
}

export function SettingsIntakeForm({ projectId }: SettingsIntakeFormProps) {
  const { data: intakeForm } = useIntakeForm(projectId);
  const createIntakeForm = useCreateIntakeForm();
  const updateIntakeForm = useUpdateIntakeForm();
  const { data: sections = [] } = useProjectSections(projectId);
  const tenantId = useAuthStore((s) => s.tenantId);
  const [intakeCopied, setIntakeCopied] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <IconClipboardText className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Formulario de Intake</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Link publico para receber solicitacoes que criam tarefas automaticamente.
      </p>

      {intakeForm ? (
        <div className="space-y-3">
          {/* Toggle active */}
          <div className="flex items-center justify-between">
            <span className="text-sm">
              Formulario {intakeForm.is_active ? (
                <Badge variant="secondary" className="ml-1 bg-green-50 text-green-700 text-[10px]">Ativo</Badge>
              ) : (
                <Badge variant="secondary" className="ml-1 text-[10px]">Inativo</Badge>
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateIntakeForm.mutate({
                  id: intakeForm.id,
                  updates: { is_active: !intakeForm.is_active },
                })
              }
            >
              {intakeForm.is_active ? "Desativar" : "Ativar"}
            </Button>
          </div>

          {/* Intake URL */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Link publico</label>
            <div className="flex items-center gap-2">
              <Input
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/intake/${intakeForm.token}`}
                readOnly
                className="h-8 text-sm flex-1 bg-muted/30"
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}/intake/${intakeForm.token}`
                  );
                  setIntakeCopied(true);
                  setTimeout(() => setIntakeCopied(false), 2000);
                }}
              >
                {intakeCopied ? (
                  <IconCheck className="size-3.5 text-green-600" />
                ) : (
                  <IconCopy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Target section */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Secao destino</label>
            <Select
              value={intakeForm.target_section_id ?? "__none__"}
              onValueChange={(val) =>
                updateIntakeForm.mutate({
                  id: intakeForm.id,
                  updates: { target_section_id: val === "__none__" ? null : val },
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Primeira secao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Primeira secao</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default status */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Status padrao</label>
            <Select
              value={intakeForm.default_status ?? "pendente"}
              onValueChange={(val) =>
                updateIntakeForm.mutate({
                  id: intakeForm.id,
                  updates: { default_status: val },
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TASK_STATUS) as [TaskStatusKey, (typeof TASK_STATUS)[TaskStatusKey]][]).map(
                  ([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                        {config.label}
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={createIntakeForm.isPending}
          onClick={() => {
            if (!tenantId) return;
            createIntakeForm.mutate({
              project_id: projectId,
              tenant_id: tenantId,
            });
          }}
        >
          <IconPlus className="size-3.5" />
          Criar formulario de intake
        </Button>
      )}
    </section>
  );
}
