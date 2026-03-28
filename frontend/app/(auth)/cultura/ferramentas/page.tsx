"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconTool,
  IconSearch,
  IconInfoCircle,
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconKey,
  IconMail,
  IconExternalLink,
  IconLock,
  IconPlus,
  IconPencil,
  IconTrash,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { ConfirmDialog, EmptyState } from "@/components/shared";
import { type TBOToolCredential } from "@/features/cultura/data/cultura-notion-seed";
import {
  useFerramentas,
  useCreateTool,
  useUpdateTool,
  useDeleteTool,
} from "@/features/cultura/hooks/use-ferramentas";
import { ToolFormDialog, type ToolFormData } from "@/features/cultura/components/tool-form-dialog";
import { useAuthStore } from "@/stores/auth-store";
import type { Tool, ToolCategory } from "@/features/cultura/services/ferramentas";

function CredentialRow({ cred }: { cred: TBOToolCredential }) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado!`);
    });
  }, []);

  const methodBadge = {
    google: { label: "Google", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    email: { label: "E-mail/Senha", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    corporativo: { label: "Corporativo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  }[cred.method];

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconKey className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{cred.label}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${methodBadge.color}`}>
          {methodBadge.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <IconMail className="size-3.5 text-muted-foreground shrink-0" />
        <code className="text-xs bg-background px-2 py-1 rounded flex-1 font-mono">
          {cred.email}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => copyToClipboard(cred.email, "E-mail")}
        >
          <IconCopy className="size-3" />
        </Button>
      </div>

      {cred.password && (
        <div className="flex items-center gap-2">
          <IconLock className="size-3.5 text-muted-foreground shrink-0" />
          <code className="text-xs bg-background px-2 py-1 rounded flex-1 font-mono">
            {showPassword ? cred.password : "••••••••••••"}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <IconEyeOff className="size-3" /> : <IconEye className="size-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => copyToClipboard(cred.password!, "Senha")}
          >
            <IconCopy className="size-3" />
          </Button>
        </div>
      )}

      {cred.url && (
        <div className="flex items-center gap-2">
          <IconExternalLink className="size-3.5 text-muted-foreground shrink-0" />
          <a
            href={cred.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
          >
            {cred.url}
          </a>
        </div>
      )}

      {cred.notes && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
          {cred.notes}
        </p>
      )}
    </div>
  );
}

function ToolCard({
  tool,
  canEdit,
  onEdit,
  onDelete,
}: {
  tool: Tool;
  canEdit: boolean;
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasCredentials = tool.credentials && tool.credentials.length > 0;
  const hasPassword = tool.credentials?.some((c) => c.password);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium">{tool.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hasPassword && (
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 dark:text-amber-400">
                <IconKey className="size-2.5 mr-0.5" />
                Senha
              </Badge>
            )}
            {canEdit && tool.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-6">
                    <IconDotsVertical className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(tool)}>
                    <IconPencil className="size-3.5 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(tool)}
                  >
                    <IconTrash className="size-3.5 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {hasCredentials && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5">
                <IconKey className="size-3" />
                {open ? "Ocultar acesso" : "Ver acesso"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {tool.credentials!.map((cred, idx) => (
                <CredentialRow key={idx} cred={cred} />
              ))}
              {tool.accessNotes && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-md px-2.5 py-1.5 leading-relaxed">
                  ⚠️ {tool.accessNotes}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export default function FerramentasPage() {
  const { role } = useAuthStore();
  const canEdit = role === "admin";

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<(Tool & { id: string; category_id: string }) | null>(null);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);

  const { data, isLoading } = useFerramentas();
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();
  const deleteTool = useDeleteTool();

  const allCategories = data?.categories ?? [];
  const boasPraticas = data?.boasPraticas ?? [];

  const filteredCategorias = useMemo(() => {
    if (!search.trim()) return allCategories;
    const q = search.toLowerCase();
    return allCategories.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.tools.length > 0);
  }, [search, allCategories]);

  const totalTools = allCategories.reduce(
    (acc, cat) => acc + cat.tools.length,
    0
  );

  const handleSave = async (data: ToolFormData) => {
    try {
      if (editingTool) {
        await updateTool.mutateAsync({ id: editingTool.id, data });
      } else {
        await createTool.mutateAsync(data);
      }
    } catch {
      // handled by mutation onError
    }
  };

  const handleDelete = async () => {
    if (!deletingTool?.id) return;
    try {
      await deleteTool.mutateAsync(deletingTool.id);
    } catch {
      // handled by mutation onError
    } finally {
      setDeletingTool(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <IconTool className="size-5" />
            Guia de Ferramentas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ferramentas oficiais, credenciais de acesso e boas práticas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{totalTools} ferramentas</Badge>
          {canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditingTool(null);
                setShowForm(true);
              }}
            >
              <IconPlus className="size-4 mr-1" />
              Nova ferramenta
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar ferramentas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boas Praticas */}
      {!isLoading && !search.trim() && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IconInfoCircle className="size-4 text-blue-600 dark:text-blue-400" />
              Boas Práticas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5">
              {boasPraticas.map((pratica, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconCheck className="size-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <span>{pratica}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {!isLoading && filteredCategorias.length > 0 ? (
        filteredCategorias.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span>{cat.emoji}</span>
              {cat.name}
              <Badge variant="outline" className="text-xs font-normal">
                {cat.tools.length}
              </Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <ToolCard
                  key={tool.id ?? tool.name}
                  tool={tool}
                  canEdit={canEdit}
                  onEdit={(t) => {
                    if (t.id && t.category_id) {
                      setEditingTool(t as Tool & { id: string; category_id: string });
                      setShowForm(true);
                    }
                  }}
                  onDelete={(t) => setDeletingTool(t)}
                />
              ))}
            </div>
          </section>
        ))
      ) : !isLoading ? (
        search.trim() ? (
          <EmptyState
            icon={IconSearch}
            title="Nenhuma ferramenta encontrada"
            description={`Nenhum resultado para "${search}". Tente outro termo.`}
            cta={{ label: "Limpar busca", onClick: () => setSearch("") }}
          />
        ) : (
          <EmptyState
            icon={IconTool}
            title="Nenhuma ferramenta cadastrada"
            description="Adicione ferramentas ao guia da equipe."
            cta={canEdit ? { label: "Nova ferramenta", onClick: () => { setEditingTool(null); setShowForm(true); } } : undefined}
          />
        )
      ) : null}

      {/* Form dialog */}
      <ToolFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        categories={allCategories}
        editing={editingTool}
        onSave={handleSave}
        isSaving={createTool.isPending || updateTool.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deletingTool}
        onOpenChange={(open) => !open && setDeletingTool(null)}
        title={`Excluir "${deletingTool?.name}"?`}
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  );
}
