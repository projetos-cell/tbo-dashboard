"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
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
import {
  IconShare,
  IconCopy,
  IconCheck,
  IconToggleRight,
  IconToggleLeft,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useShareLinks, useCreateShareLink, useToggleShareLink } from "@/features/review/hooks/use-review-share";
import type { SharePermission } from "@/features/review/types";

const PERMISSION_LABELS: Record<SharePermission, { label: string; description: string }> = {
  view_only: { label: "Apenas visualizar", description: "Pode ver imagens, mas não comentar" },
  view_comment: { label: "Visualizar e comentar", description: "Pode ver e adicionar comentários" },
  view_approve: { label: "Visualizar e aprovar", description: "Pode ver, comentar e aprovar" },
};

const CreateShareLinkSchema = z.object({
  reviewer_name: z.string().optional(),
  reviewer_email: z.string().email("Email inválido").optional().or(z.literal("")),
  permissions: z.enum(["view_only", "view_comment", "view_approve"]),
  expires_at: z.string().optional(),
});

type CreateShareLinkInput = z.infer<typeof CreateShareLinkSchema>;

interface ReviewShareDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
      {copied ? (
        <IconCheck className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <IconCopy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function ReviewShareDialog({ projectId, trigger }: ReviewShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: links = [], isLoading } = useShareLinks(projectId);
  const createLink = useCreateShareLink(projectId);
  const toggleLink = useToggleShareLink(projectId);

  const form = useForm<CreateShareLinkInput>({
    resolver: zodResolver(CreateShareLinkSchema),
    defaultValues: { permissions: "view_comment" },
  });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const onSubmit = (values: CreateShareLinkInput) => {
    createLink.mutate(
      {
        reviewer_name: values.reviewer_name || undefined,
        reviewer_email: values.reviewer_email || undefined,
        permissions: values.permissions,
        expires_at: values.expires_at || null,
      },
      {
        onSuccess: () => {
          form.reset();
          setShowForm(false);
        },
      }
    );
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <IconShare className="mr-1.5 h-4 w-4" />
            Compartilhar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Links de Compartilhamento</DialogTitle>
        </DialogHeader>

        {/* Existing links */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
          )}

          {!isLoading && links.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum link criado ainda.
            </p>
          )}

          {links.map((link) => {
            const expired = isExpired(link.expires_at);
            const shareUrl = `${baseUrl}/review-share/${link.token}`;

            return (
              <div
                key={link.id}
                className="flex items-start gap-3 rounded-lg border p-3 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {link.reviewer_name && (
                      <span className="font-medium truncate">{link.reviewer_name}</span>
                    )}
                    {link.reviewer_email && (
                      <span className="text-muted-foreground truncate text-xs">
                        {link.reviewer_email}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs shrink-0"
                      style={{ opacity: link.is_active && !expired ? 1 : 0.5 }}
                    >
                      {PERMISSION_LABELS[link.permissions].label}
                    </Badge>
                    {expired && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Expirado
                      </Badge>
                    )}
                    {!link.is_active && !expired && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Inativo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {shareUrl}
                    </span>
                    <CopyButton text={shareUrl} />
                  </div>

                  {link.expires_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expira em:{" "}
                      {format(new Date(link.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => toggleLink.mutate({ id: link.id, isActive: !link.is_active })}
                  title={link.is_active ? "Desativar link" : "Ativar link"}
                >
                  {link.is_active ? (
                    <IconToggleRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <IconToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* New link form */}
        {showForm ? (
          <>
            <Separator />
            <Form
              form={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
            >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="reviewer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do revisor</FormLabel>
                        <FormControl>
                          <Input placeholder="João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="joao@cliente.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissão</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.keys(PERMISSION_LABELS) as SharePermission[]).map((key) => (
                            <SelectItem key={key} value={key}>
                              <div>
                                <p className="font-medium">{PERMISSION_LABELS[key].label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {PERMISSION_LABELS[key].description}
                                </p>
                              </div>
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
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiração (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowForm(false); form.reset(); }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={createLink.isPending}>
                    {createLink.isPending ? "Criando..." : "Criar Link"}
                  </Button>
                </div>
            </Form>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
            <IconPlus className="mr-1.5 h-4 w-4" />
            Novo Link
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
