"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconX, IconLoader2, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  useCreateScheduledReport,
  useUpdateScheduledReport,
} from "../hooks/use-reports";
import type { ScheduledReport } from "../services/scheduled-reports";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  report_type: z.enum(["projects", "finance", "commercial", "people", "custom"]),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly"]),
  day_of_week: z.coerce.number().min(0).max(6).optional(),
  day_of_month: z.coerce.number().min(1).max(28).optional(),
  format: z.enum(["pdf", "csv", "xlsx"]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ── Options ───────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { value: "projects", label: "Projetos" },
  { value: "finance", label: "Financeiro" },
  { value: "commercial", label: "Comercial" },
  { value: "people", label: "Pessoas" },
  { value: "custom", label: "Personalizado" },
];

const FREQUENCIES = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

const FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel (XLSX)" },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface ScheduledReportFormProps {
  report?: ScheduledReport;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ScheduledReportForm({
  report,
  onSuccess,
  onCancel,
}: ScheduledReportFormProps) {
  const [recipients, setRecipients] = useState<string[]>(report?.recipients ?? []);
  const [emailInput, setEmailInput] = useState("");

  const createReport = useCreateScheduledReport();
  const updateReport = useUpdateScheduledReport();

  const isEditing = !!report;
  const isPending = createReport.isPending || updateReport.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: report?.name ?? "",
      report_type: (report?.report_type ?? "projects") as FormValues["report_type"],
      frequency: (report?.frequency ?? "weekly") as FormValues["frequency"],
      day_of_week: report?.day_of_week ?? 1,
      day_of_month: report?.day_of_month ?? 1,
      format: (report?.format ?? "pdf") as FormValues["format"],
      is_active: report?.is_active ?? true,
    },
  });

  const frequency = form.watch("frequency");
  const showDayOfWeek = ["weekly", "biweekly"].includes(frequency);
  const showDayOfMonth = frequency === "monthly";

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido.");
      return;
    }
    if (recipients.includes(email)) {
      toast.error("E-mail já adicionado.");
      return;
    }
    setRecipients((prev) => [...prev, email]);
    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    setRecipients((prev) => prev.filter((e) => e !== email));
  };

  const onSubmit = async (values: FormValues) => {
    if (recipients.length === 0) {
      toast.error("Adicione pelo menos um destinatário.");
      return;
    }

    const payload = {
      name: values.name,
      report_type: values.report_type,
      frequency: values.frequency,
      day_of_week: showDayOfWeek ? values.day_of_week : undefined,
      day_of_month: showDayOfMonth ? values.day_of_month : undefined,
      recipients,
      format: values.format,
      is_active: values.is_active,
    };

    if (isEditing && report) {
      await updateReport.mutateAsync({ id: report.id, updates: payload });
      toast.success("Relatório atualizado.");
    } else {
      await createReport.mutateAsync(payload);
      toast.success("Relatório agendado com sucesso.");
    }

    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Relatório</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Relatório Semanal de Projetos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Report Type */}
        <FormField
          control={form.control}
          name="report_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Relatório</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REPORT_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Frequency */}
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequência</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Day of week (weekly/biweekly) */}
        {showDayOfWeek && (
          <FormField
            control={form.control}
            name="day_of_week"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia da Semana</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={String(field.value ?? 1)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Day of month (monthly) */}
        {showDayOfMonth && (
          <FormField
            control={form.control}
            name="day_of_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia do Mês (1-28)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Recipients */}
        <div className="space-y-2">
          <FormLabel>Destinatários</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="email@agenciatbo.com.br"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmail();
                }
              }}
            />
            <Button type="button" variant="outline" size="icon" onClick={addEmail}>
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipients.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1 pr-1">
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="ml-1 rounded hover:bg-muted"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Format */}
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Ativo</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Enviar automaticamente conforme agendamento
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar" : "Criar Agendamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
