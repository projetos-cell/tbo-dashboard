"use client";

import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CulturaItemCard } from "@/components/cultura/cultura-item-card";
import { CulturaItemForm } from "@/components/cultura/cultura-item-form";
import { CulturaItemDetail } from "@/components/cultura/cultura-item-detail";
import {
  useCulturaItems,
  useCreateCulturaItem,
  useUpdateCulturaItem,
  useDeleteCulturaItem,
} from "@/hooks/use-cultura";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

export default function ManualPage() {
  const { data: items, isLoading } = useCulturaItems("manual");
  const createItem = useCreateCulturaItem();
  const updateItem = useUpdateCulturaItem();
  const deleteItem = useDeleteCulturaItem();
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CulturaRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleSave = async (data: {
    title: string;
    content: string;
    content_html: string;
    category: string;
    status: string;
  }) => {
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
  };

  const handleDelete = async (item: CulturaRow) => {
    const confirmed = window.confirm(`Excluir "${item.title}"?`);
    if (!confirmed) return;
    await deleteItem.mutateAsync(item.id);
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
          <p className="text-sm text-muted-foreground">
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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
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
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {stripHtml(item.content_html).slice(0, 100)}
                    </p>
                  )}
                </div>
                <BookOpen className="size-4 text-muted-foreground/40 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="size-8 mx-auto mb-2 opacity-40" />
          <p>Nenhuma pagina do manual cadastrada.</p>
        </div>
      )}

      <CulturaItemForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        defaultCategory="manual"
        onSave={handleSave}
      />
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
