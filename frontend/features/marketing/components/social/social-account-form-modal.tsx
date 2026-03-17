"use client";

// Feature #42 — Modal adicionar/editar conta social (platform, handle, profile_url)

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCreateRsmAccount,
  useUpdateRsmAccount,
} from "../../hooks/use-marketing-social";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "pinterest", label: "Pinterest" },
] as const;

const schema = z.object({
  platform: z.string().min(1, "Plataforma obrigatória"),
  handle: z.string().min(1, "Handle obrigatório"),
  profile_url: z.string().url("URL inválida").or(z.literal("")).nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Account {
  id: string;
  platform: string;
  handle: string;
  profile_url: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  account?: Account | null;
}

export function SocialAccountFormModal({ open, onClose, account }: Props) {
  const createMutation = useCreateRsmAccount();
  const updateMutation = useUpdateRsmAccount();
  const isEditing = !!account;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: "",
      handle: "",
      profile_url: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        platform: account?.platform ?? "",
        handle: account?.handle ?? "",
        profile_url: account?.profile_url ?? "",
      });
    }
  }, [open, account, form]);

  function onSubmit(values: FormValues) {
    const payload = {
      platform: values.platform,
      handle: values.handle,
      profile_url: values.profile_url || null,
    };

    if (isEditing && account) {
      updateMutation.mutate(
        { id: account.id, updates: payload },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(payload as never, { onSuccess: onClose });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Conta" : "Conectar Conta"}
          </DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plataforma</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar plataforma..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
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
            name="handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle / @username</FormLabel>
                <Input placeholder="Ex: agenciatbo" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profile_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Perfil (opcional)</FormLabel>
                <Input
                  type="url"
                  placeholder="https://instagram.com/agenciatbo"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Conectar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
