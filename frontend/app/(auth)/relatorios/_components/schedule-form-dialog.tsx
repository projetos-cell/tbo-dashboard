"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconX } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateSchedule, useUpdateSchedule } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type ScheduleRow = Database["public"]["Tables"]["report_schedules"]["Row"];

const SCHEDULE_TYPES = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "client", label: "Por Cliente" },
] as const;

const CRON_PRESETS = [
  { value: "0 8 * * *", label: "Diario as 08:00" },
  { value: "0 8 * * 1", label: "Segunda as 08:00" },
  { value: "0 8 * * 5", label: "Sexta as 08:00" },
  { value: "0 8 1 * *", label: "Dia 1 do mes as 08:00" },
  { value: "custom", label: "Personalizado" },
] as const;

const SCHEDULE_PRESETS = [
  {
    label: "Resumo Diario",
    name: "Resumo diario de performance",
    type: "daily" as const,
    cron: "0 8 * * *",
    description: "Resumo diario com metricas de performance da equipe.",
  },
  {
    label: "Report Semanal",
    name: "Report semanal consolidado",
    type: "weekly" as const,
    cron: "0 8 * * 1",
    description: "Relatorio semanal consolidado com KPIs e destaques.",
  },
  {
    label: "Fechamento Mensal",
    name: "Fechamento mensal",
    type: "monthly" as const,
    cron: "0 8 1 * *",
    description: "Relatorio de fechamento mensal com resultados e comparativos.",
  },
  {
    label: "Report por Cliente",
    name: "Report de cliente",
    type: "client" as const,
    cron: "0 8 * * 5",
    description: "Relatorio personalizado por cliente para envio externo.",
  },
] as const;

const scheduleSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().optional(),
  type: z.enum(["daily", "weekly", "monthly", "client"]),
  cron: z.string().min(1, "Expressao cron e obrigatoria"),
  enabled: z.boolean(),
  recipients: z.array(z.string().email("Email invalido")),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ScheduleRow | null;
}

const emptyForm: ScheduleFormData = {
  name: "",
  description: "",
  type: "daily",
  cron: "0 8 * * *",
  enabled: true,
  recipients: [],
};

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const [form, setForm] = useState<ScheduleFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleFormData, string>>>({});
  const [emailInput, setEmailInput] = useState("");
  const [cronPreset, setCronPreset] = useState("0 8 * * *");

  const isEditing = !!schedule;

  useEffect(() => {
    if (schedule) {
      const recipients = Array.isArray(schedule.recipients)
        ? (schedule.recipients as string[])
        : [];
      const cron = schedule.cron ?? "0 8 * * *";
      setForm({
        name: schedule.name ?? "",
        description: schedule.description ?? "",
        type: (schedule.type as ScheduleFormData["type"]) ?? "daily",
        cron,
        enabled: schedule.enabled ?? true,
        recipients,
      });
      const matchingPreset = CRON_PRESETS.find((p) => p.value === cron);
      setCronPreset(matchingPreset ? cron : "custom");
    } else {
      setForm(emptyForm);
      setCronPreset("0 8 * * *");
    }
    setErrors({});
    setEmailInput("");
  }, [schedule, open]);

  function handleAddEmail() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    const emailCheck = z.string().email().safeParse(email);
    if (!emailCheck.success) {
      setErrors((prev) => ({ ...prev, recipients: "Email invalido" }));
      return;
    }
    if (form.recipients.includes(email)) {
      setErrors((prev) => ({ ...prev, recipients: "Email ja adicionado" }));
      return;
    }
    setForm((prev) => ({ ...prev, recipients: [...prev.recipients, email] }));
    setEmailInput("");
    setErrors((prev) => ({ ...prev, recipients: undefined }));
  }

  function handleRemoveEmail(email: string) {
    setForm((prev) => ({ ...prev, recipients: prev.recipients.filter((e) => e !== email) }));
  }

  function handleEmailKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  }

  function handleCronPresetChange(value: string) {
    setCronPreset(value);
    if (value !== "custom") {
      setForm((prev) => ({ ...prev, cron: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = scheduleSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ScheduleFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ScheduleFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (!tenantId) return;

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      type: form.type,
      cron: form.cron,
      enabled: form.enabled,
      recipients: form.recipients as unknown as Database["public"]["Tables"]["report_schedules"]["Insert"]["recipients"],
    };

    try {
      if (isEditing && schedule) {
        await updateMutation.mutateAsync({ id: schedule.id, updates: payload });
        toast({ title: "Agendamento atualizado", description: `"${form.name}" salvo com sucesso.` });
      } else {
        await createMutation.mutateAsync({ ...payload, tenant_id: tenantId } as never);
        toast({ title: "Agendamento criado", description: `"${form.name}" configurado com sucesso.` });
      }
      onOpenChange(false);
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel salvar o agendamento.", variant: "destructive" });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Templates rapidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {SCHEDULE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        name: preset.name,
                        description: preset.description,
                        type: preset.type,
                        cron: preset.cron,
                      }));
                      setCronPreset(preset.cron);
                      setErrors({});
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="schedule-name">Nome *</Label>
            <Input
              id="schedule-name"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ex: Relatorio semanal de performance"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-desc">Descricao</Label>
            <Textarea
              id="schedule-desc"
              value={form.description ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o conteudo deste relatorio..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((prev) => ({ ...prev, type: v as ScheduleFormData["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequencia</Label>
              <Select value={cronPreset} onValueChange={handleCronPresetChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRON_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {cronPreset === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="schedule-cron">Expressao Cron</Label>
              <Input
                id="schedule-cron"
                value={form.cron}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, cron: e.target.value }));
                  setErrors((prev) => ({ ...prev, cron: undefined }));
                }}
                placeholder="0 8 * * 1-5"
                className="font-mono text-sm"
              />
              {errors.cron && <p className="text-xs text-red-500">{errors.cron}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Destinatarios</Label>
            <div className="flex gap-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="email@exemplo.com"
                type="email"
              />
              <Button type="button" variant="outline" onClick={handleAddEmail} className="shrink-0">
                Adicionar
              </Button>
            </div>
            {errors.recipients && <p className="text-xs text-red-500">{errors.recipients}</p>}
            {form.recipients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 pr-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.enabled}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, enabled: checked }))}
            />
            <Label>Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !form.name.trim()}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
