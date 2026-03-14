"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FREQUENCY_LABELS } from "@/features/cultura/services/ritual-types";
import type { Database } from "@/lib/supabase/types";

type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

const ritualSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  frequency: z.string().min(1, "Selecione uma frequência"),
  duration_minutes: z
    .number()
    .min(5, "Mínimo 5 minutos")
    .max(480, "Máximo 8 horas"),
  default_agenda: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export type RitualFormData = z.infer<typeof ritualSchema>;

const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS);

interface RitualFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: RitualTypeRow | null;
  onSave: (data: RitualFormData) => Promise<void>;
  isSaving: boolean;
}

export function RitualFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  isSaving,
}: RitualFormDialogProps) {
  const form = useForm<RitualFormData>({
    resolver: zodResolver(ritualSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "weekly",
      duration_minutes: 60,
      default_agenda: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        form.reset({
          name: editing.name ?? "",
          description: editing.description ?? "",
          frequency: editing.frequency ?? "weekly",
          duration_minutes: editing.duration_minutes ?? 60,
          default_agenda: editing.default_agenda ?? "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          frequency: "weekly",
          duration_minutes: 60,
          default_agenda: "",
        });
      }
    }
  }, [open, editing, form]);

  const handleSubmit = async (data: RitualFormData) => {
    await onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Ritual" : "Novo Ritual"}</DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Daily Standup" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Para que serve este ritual?"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={480}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="default_agenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agenda padrão</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={"1. Check-in\n2. Atualizações\n3. Bloqueios\n4. Próximos passos"}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
