"use client";

// Features #27 — filtro combinado tipo + status + canal com chips de filtro ativo
// Feature #28 — inline status update (clicar no badge → dropdown de status)

import { useState } from "react";
import Link from "next/link";
import {
  IconCalendarEvent,
  IconFileText,
  IconPhoto,
  IconCheckbox,
  IconArrowRight,
  IconPlus,
  IconX,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useContentItems,
  useContentBriefs,
  useContentAssets,
  useContentApprovals,
  useUpdateContentItem,
  useDeleteContentItem,
} from "@/features/marketing/hooks/use-marketing-content";
import { ContentItemFormModal } from "@/features/marketing/components/content/content-item-form-modal";
import { MARKETING_CONTENT_STATUS } from "@/lib/constants";
import type { ContentItem, ContentStatus, ContentType } from "@/features/marketing/types/marketing";

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  post_social: "Post Social",
  blog: "Blog",
  video: "Vídeo",
  email: "E-mail",
  stories: "Stories",
  reels: "Reels",
  carrossel: "Carrossel",
  infografico: "Infográfico",
  ebook: "E-book",
  outro: "Outro",
};

const SECTIONS = [
  { href: "/marketing/conteudo/calendario", label: "Calendario Editorial", description: "Planeje e visualize publicacoes no calendario", icon: IconCalendarEvent, color: "#8b5cf6", bgClass: "bg-purple-500/10" },
  { href: "/marketing/conteudo/briefs", label: "Briefs", description: "Briefs de conteudo para producao", icon: IconFileText, color: "#3b82f6", bgClass: "bg-blue-500/10" },
  { href: "/marketing/conteudo/assets", label: "Biblioteca de Assets", description: "Criativos, imagens e arquivos de campanha", icon: IconPhoto, color: "#ec4899", bgClass: "bg-pink-500/10" },
  { href: "/marketing/conteudo/aprovacoes", label: "Aprovacoes", description: "Workflow de revisao e aprovacao de conteudo", icon: IconCheckbox, color: "#22c55e", bgClass: "bg-emerald-500/10" },
] as const;

// Feature #28 — inline status badge com dropdown
function InlineStatusBadge({ item }: { item: ContentItem }) {
  const updateMutation = useUpdateContentItem();
  const statusDef = MARKETING_CONTENT_STATUS[item.status as ContentStatus];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant="secondary"
          style={{ backgroundColor: statusDef?.bg, color: statusDef?.color }}
          className="cursor-pointer hover:opacity-80 transition-opacity select-none"
        >
          {statusDef?.label ?? item.status}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(MARKETING_CONTENT_STATUS).map(([k, v]) => (
          <DropdownMenuItem
            key={k}
            className={k === item.status ? "font-medium" : ""}
            onClick={() =>
              updateMutation.mutate({ id: item.id, data: { status: k as ContentStatus } })
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: v.color }}
            />
            {v.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Feature #27 — chip de filtro
function FilterChip({
  label,
  active,
  onToggle,
  onRemove,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          : "border-border bg-background text-muted-foreground hover:border-foreground/30"
      }`}
    >
      {label}
      {active && onRemove && (
        <IconX
          className="h-3 w-3 ml-0.5"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        />
      )}
    </button>
  );
}

function KPICard({ label, value, isLoading }: { label: string; value: string; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ConteudoContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  // Feature #27 — filter state
  const [filterTypes, setFilterTypes] = useState<ContentType[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<ContentStatus[]>([]);
  const [filterChannels, setFilterChannels] = useState<string[]>([]);

  const { data: items, isLoading: l1, error: e1, refetch } = useContentItems();
  const { data: briefs, isLoading: l2 } = useContentBriefs();
  const { data: assets, isLoading: l3 } = useContentAssets();
  const { data: approvals, isLoading: l4 } = useContentApprovals();
  const deleteMutation = useDeleteContentItem();

  const isLoading = l1 || l2 || l3 || l4;
  const pending = approvals?.filter((a) => a.status === "pending").length ?? 0;

  // Derive filter options from data
  const typeOptions = Array.from(new Set((items ?? []).map((i) => i.type)));
  const channelOptions = Array.from(new Set((items ?? []).filter((i) => i.channel).map((i) => i.channel!)));

  // Apply filters
  const filtered = (items ?? []).filter((i) => {
    if (filterTypes.length && !filterTypes.includes(i.type)) return false;
    if (filterStatuses.length && !filterStatuses.includes(i.status)) return false;
    if (filterChannels.length && !filterChannels.includes(i.channel ?? "")) return false;
    return true;
  });

  const hasActiveFilters = filterTypes.length > 0 || filterStatuses.length > 0 || filterChannels.length > 0;

  const toggleType = (t: ContentType) =>
    setFilterTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleStatus = (s: ContentStatus) =>
    setFilterStatuses((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleChannel = (c: string) =>
    setFilterChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conteúdo</h1>
          <p className="text-sm text-muted-foreground">Gestão de conteúdo, briefs, assets e aprovações.</p>
        </div>
        <Button onClick={() => { setEditItem(null); setModalOpen(true); }}>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Conteúdo
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Conteúdos" value={String(items?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Briefs" value={String(briefs?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Assets" value={String(assets?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Aprovações pendentes" value={String(pending)} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full transition-colors group-hover:border-purple-400/40">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${s.bgClass}`}>
                    <Icon className="size-6" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Feature #27 — filtros combinados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Todos os Conteúdos
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => {
                setFilterTypes([]);
                setFilterStatuses([]);
                setFilterChannels([]);
              }}
            >
              <IconX className="h-3 w-3" /> Limpar filtros
            </button>
          )}
        </div>

        {(typeOptions.length > 0 || channelOptions.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((t) => (
              <FilterChip
                key={t}
                label={CONTENT_TYPE_LABELS[t] ?? t}
                active={filterTypes.includes(t)}
                onToggle={() => toggleType(t)}
                onRemove={() => toggleType(t)}
              />
            ))}
            {Object.entries(MARKETING_CONTENT_STATUS).map(([k, v]) => (
              <FilterChip
                key={k}
                label={v.label}
                active={filterStatuses.includes(k as ContentStatus)}
                onToggle={() => toggleStatus(k as ContentStatus)}
                onRemove={() => toggleStatus(k as ContentStatus)}
              />
            ))}
            {channelOptions.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={filterChannels.includes(c)}
                onToggle={() => toggleChannel(c)}
                onRemove={() => toggleChannel(c)}
              />
            ))}
          </div>
        )}
      </div>

      {e1 ? (
        <ErrorState message="Erro ao carregar conteúdos." onRetry={() => refetch()} />
      ) : l1 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconPencil}
          title={hasActiveFilters ? "Nenhum conteúdo encontrado" : "Nenhum conteúdo criado"}
          description={
            hasActiveFilters
              ? "Ajuste os filtros para ver outros conteúdos."
              : "Crie seu primeiro conteúdo para começar."
          }
          cta={
            !hasActiveFilters
              ? { label: "Criar Conteúdo", onClick: () => setModalOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Canal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-[200px]">{item.title}</div>
                    {item.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.tags.slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] h-4 px-1">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                  </td>
                  {/* Feature #28 — inline status update */}
                  <td className="px-4 py-3">
                    <InlineStatusBadge item={item} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {item.channel ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {item.scheduled_date
                      ? new Date(item.scheduled_date).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setEditItem(item); setModalOpen(true); }}
                      >
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ContentItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        item={editItem}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conteúdo?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ConteudoPage() {
  return (
    <RequireRole module="marketing">
      <ConteudoContent />
    </RequireRole>
  );
}
