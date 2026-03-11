"use client";

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CulturaItemCard } from "@/features/cultura/components/cultura-item-card";
import { CulturaItemForm } from "@/features/cultura/components/cultura-item-form";
import { CulturaItemDetail } from "@/features/cultura/components/cultura-item-detail";
import {
  useCulturaItems,
  useCreateCulturaItem,
  useUpdateCulturaItem,
  useDeleteCulturaItem,
} from "@/features/cultura/hooks/use-cultura";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorState, ConfirmDialog, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

export default function ManualPage() {
  const { data: items, isLoading, error, refetch } = useCulturaItems("manual");
  const createItem = useCreateCulturaItem();
  const updateItem = useUpdateCulturaItem();
  const deleteItem = useDeleteCulturaItem();
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CulturaRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<CulturaRow | null>(null);

  const handleSave = async (data: {
    title: string;
    content: string;
    content_html: string;
    category: string;
    status: string;
  }) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          updates: {
            title: data.title,
            content: data.content,
            content_html: data.content_html,
            status: data.status,
          },
          editedBy: user?.id,
        });
      } else {
        await createItem.mutateAsync({
          title: data.title,
          content: data.content,
          content_html: data.content_html,
          category: "manual",
          status: data.status,
          tenant_id: tenantId!,
          author_id: user?.id,
        } as Database["public"]["Tables"]["cultura_items"]["Insert"]);
      }
    } catch {
      // handled by mutation onError
    }
  };

  const handleDelete = (item: CulturaRow) => {
    setDeletingItem(item);
  };

  if (viewingId) {
    return (
      <CulturaItemDetail
        itemId={viewingId}
        onBack={() => setViewingId(null)}
        onEdit={() => {
          const item = items?.find((i) => i.id === viewingId);
          if (item) {
            setEditingItem(item);
            setShowForm(true);
            setViewingId(null);
          }
        }}
        canEdit={canEdit}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Manual</h1>
          <p className="text-sm text-gray-500">
            Manual da cultura e guias de referencia.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            <Plus className="size-4 mr-1" />
            Nova pagina
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : items && items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className="group cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setViewingId(item.id)}
            >
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className="flex items-center justify-center size-8 rounded-md bg-sky-50 dark:bg-sky-900/20 text-sky-600 text-sm font-medium shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {item.title}
                  </h3>
                  {item.content_html && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {stripHtml(item.content_html).slice(0, 100)}
                    </p>
                  )}
                </div>
                <BookOpen className="size-4 text-gray-500/40 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma pagina do manual cadastrada"
          description="Crie guias e referencias para a cultura do time."
          cta={canEdit ? { label: "Nova pagina", onClick: () => { setEditingItem(null); setShowForm(true); } } : undefined}
        />
      )}

      <CulturaItemForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        defaultCategory="manual"
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title={`Excluir "${deletingItem?.title}"?`}
        description="Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          try {
            if (deletingItem) await deleteItem.mutateAsync(deletingItem.id);
          } catch {
            // handled by mutation onError
          } finally {
            setDeletingItem(null);
          }
        }}
      />
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
