"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Tool, ToolCategory } from "@/features/cultura/services/ferramentas";

const toolSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  category_id: z.string().min(1, "Selecione uma categoria"),
});

export type ToolFormData = z.infer<typeof toolSchema>;

interface ToolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ToolCategory[];
  editing?: (Tool & { id: string; category_id: string }) | null;
  onSave: (data: ToolFormData) => Promise<void>;
  isSaving?: boolean;
}

export function ToolFormDialog({
  open,
  onOpenChange,
  categories,
  editing,
  onSave,
  isSaving = false,
}: ToolFormDialogProps) {
  const form = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      category_id: editing?.category_id ?? "",
    },
  });

  // Reset when editing changes
  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset();
    onOpenChange(open);
  };

  // Sync form when editing prop changes
  if (editing) {
    const current = form.getValues();
    if (
      current.name !== editing.name ||
      current.description !== editing.description ||
      current.category_id !== (editing.category_id ?? "")
    ) {
      form.reset({
        name: editing.name,
        description: editing.description,
        category_id: editing.category_id ?? "",
      });
    }
  }

  const handleSubmit = async (data: ToolFormData) => {
    await onSave(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar ferramenta" : "Nova ferramenta"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Figma" {...field} />
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
                    placeholder="Para que serve esta ferramenta na TBO?"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? "Salvando..." : editing ? "Salvar alterações" : "Criar ferramenta"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
