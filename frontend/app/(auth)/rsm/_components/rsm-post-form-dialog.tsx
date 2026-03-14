"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRsmPost, useUpdateRsmPost, useRsmAccounts } from "@/hooks/use-rsm";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type RsmPostRow = Database["public"]["Tables"]["rsm_posts"]["Row"];

const POST_TYPES = [
  { value: "feed", label: "Feed" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel" },
  { value: "carousel", label: "Carrossel" },
  { value: "video", label: "Vídeo" },
  { value: "outro", label: "Outro" },
];

const POST_STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "published", label: "Publicado" },
  { value: "failed", label: "Falhou" },
];

interface RsmPostFormDialogProps {
  open: boolean;
  onClose: () => void;
  post?: RsmPostRow | null;
}

export function RsmPostFormDialog({ open, onClose, post }: RsmPostFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createPost = useCreateRsmPost();
  const updatePost = useUpdateRsmPost();
  const { toast } = useToast();
  const { data: accounts = [] } = useRsmAccounts();

  const isEdit = !!post;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("feed");
  const [status, setStatus] = useState("draft");
  const [accountId, setAccountId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (post) {
        setTitle(post.title ?? "");
        setContent(post.content ?? "");
        setType(post.type ?? "feed");
        setStatus(post.status ?? "draft");
        setAccountId(post.account_id ?? "");
        setScheduledDate(
          post.scheduled_date ? post.scheduled_date.slice(0, 10) : ""
        );
      } else {
        setTitle("");
        setContent("");
        setType("feed");
        setStatus("draft");
        setAccountId(accounts[0]?.id ?? "");
        setScheduledDate("");
      }
      setErrors({});
    }
  }, [open, post, accounts]);

  function validate() {
    const e: Record<string, string> = {};
    if (!accountId) e.accountId = "Conta é obrigatória";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (!tenantId) return;

    try {
      if (isEdit && post) {
        await updatePost.mutateAsync({
          id: post.id,
          updates: {
            title: title.trim() || null,
            content: content.trim() || null,
            type,
            status,
            account_id: accountId,
            scheduled_date: scheduledDate || null,
          } as never,
        });
        toast({ title: "Post atualizado" });
      } else {
        await createPost.mutateAsync({
          tenant_id: tenantId,
          account_id: accountId,
          title: title.trim() || null,
          content: content.trim() || null,
          type,
          status,
          scheduled_date: scheduledDate || null,
          source: "manual",
        } as never);
        toast({ title: "Post criado" });
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar post", variant: "destructive" });
    }
  }

  const isPending = createPost.isPending || updatePost.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Post" : "Novo Post"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conta */}
          <div>
            <Label>Conta *</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className={errors.accountId ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecionar conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.handle} ({a.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-xs text-red-600 mt-1">{errors.accountId}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="post-title">Título</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do post"
            />
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de Agendamento */}
          {status === "scheduled" && (
            <div>
              <Label htmlFor="post-scheduled">Data de Agendamento</Label>
              <Input
                id="post-scheduled"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          )}

          {/* Conteúdo */}
          <div>
            <Label htmlFor="post-content">Conteúdo</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Texto do post..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
