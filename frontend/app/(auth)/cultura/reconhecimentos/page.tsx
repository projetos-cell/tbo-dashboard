"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReconhecimentoCard } from "@/components/cultura/reconhecimento-card";
import { CulturaItemForm } from "@/components/cultura/cultura-item-form";
import { CulturaItemDetail } from "@/components/cultura/cultura-item-detail";
import {
  useCulturaItems,
  useCreateCulturaItem,
  useUpdateCulturaItem,
  useDeleteCulturaItem,
} from "@/hooks/use-cultura";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

export default function ReconhecimentosPage() {
  const { data: items, isLoading, error, refetch } = useCulturaItems("reconhecimento");
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
        category: "reconhecimento",
        status: data.status,
        tenant_id: tenantId!,
        author_id: user?.id,
      } as Database["public"]["Tables"]["cultura_items"]["Insert"]);
    }
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
          <h1 className="text-xl font-bold tracking-tight">Reconhecimentos</h1>
          <p className="text-sm text-muted-foreground">
            Mural de reconhecimentos e elogios do time.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          <Plus className="size-4 mr-1" />
          Novo reconhecimento
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : items && items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ReconhecimentoCard
              key={item.id}
              item={item}
              onClick={(i) => setViewingId(i.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum reconhecimento registrado.</p>
          <p className="text-sm mt-1">
            Seja o primeiro a reconhecer um colega!
          </p>
        </div>
      )}

      <CulturaItemForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        defaultCategory="reconhecimento"
        onSave={handleSave}
      />
    </div>
  );
}
