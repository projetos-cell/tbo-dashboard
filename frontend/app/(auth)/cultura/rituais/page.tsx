"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function RituaisPage() {
  const { data: items, isLoading } = useCulturaItems("ritual");
  const createItem = useCreateCulturaItem();
  const updateItem = useUpdateCulturaItem();
  const deleteItem = useDeleteCulturaItem();
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "admin" || role === "po";

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
        category: "ritual",
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
          <h1 className="text-xl font-bold tracking-tight">Rituais</h1>
          <p className="text-sm text-muted-foreground">
            Rituais e cerimonias que fortalecem a cultura do time.
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
            Novo ritual
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CulturaItemCard
              key={item.id}
              item={item}
              canEdit={canEdit}
              onView={(i) => setViewingId(i.id)}
              onEdit={(i) => {
                setEditingItem(i);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum ritual cadastrado.</p>
        </div>
      )}

      <CulturaItemForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        defaultCategory="ritual"
        onSave={handleSave}
      />
    </div>
  );
}
