"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  IconPlus,
  IconSearch,
  IconX,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CulturaItemForm } from "@/features/cultura/components/cultura-item-form";
import { CulturaItemDetail } from "@/features/cultura/components/cultura-item-detail";
import { ManualItemList } from "@/features/cultura/components/manual-item-list";
import { ConfirmDialog } from "@/components/shared";
import {
  useCulturaItems,
  useCreateCulturaItem,
  useUpdateCulturaItem,
  useDeleteCulturaItem,
  useReorderCulturaItems,
} from "@/features/cultura/hooks/use-cultura";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

export default function ManualPage() {
  const { data: items, isLoading, error, refetch } = useCulturaItems("manual");
  const createItem = useCreateCulturaItem();
  const updateItem = useUpdateCulturaItem();
  const deleteItem = useDeleteCulturaItem();
  const reorder = useReorderCulturaItems("manual");
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const [orderedItems, setOrderedItems] = useState<CulturaRow[]>([]);
  const undoStack = useRef<CulturaRow[][]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CulturaRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<CulturaRow | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (items) setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    if (!canEdit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.current.length > 0) {
        const prev = undoStack.current.pop()!;
        setOrderedItems(prev);
        reorder.mutate(prev.map((item, idx) => ({ id: item.id, order_index: idx })));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, reorder]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return orderedItems;
    const q = search.toLowerCase();
    return orderedItems.filter(
      (i) => i.title.toLowerCase().includes(q) || (i.content ?? "").toLowerCase().includes(q)
    );
  }, [orderedItems, search]);

  function handleReorder(newOrder: CulturaRow[]) {
    undoStack.current.push([...orderedItems]);
    setOrderedItems(newOrder);
    reorder.mutate(newOrder.map((item, idx) => ({ id: item.id, order_index: idx })));
  }

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
          updates: { title: data.title, content: data.content, content_html: data.content_html, status: data.status },
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
      setShowForm(false);
      setEditingItem(null);
    } catch {
      // handled by mutation onError
    }
  };

  // Detail viewer mode
  if (viewingId) {
    const currentIndex = orderedItems.findIndex((i) => i.id === viewingId);
    const prevItem = currentIndex > 0 ? orderedItems[currentIndex - 1] : null;
    const nextItem = currentIndex < orderedItems.length - 1 ? orderedItems[currentIndex + 1] : null;

    return (
      <div className="space-y-4">
        {orderedItems.length > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled={!prevItem} onClick={() => prevItem && setViewingId(prevItem.id)} className="gap-1 text-xs">
              <IconChevronLeft className="size-3.5" /> Anterior
            </Button>
            <span className="text-xs text-muted-foreground">{currentIndex + 1} / {orderedItems.length}</span>
            <Button variant="ghost" size="sm" disabled={!nextItem} onClick={() => nextItem && setViewingId(nextItem.id)} className="gap-1 text-xs">
              Próximo <IconChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
        <CulturaItemDetail
          itemId={viewingId}
          onBack={() => setViewingId(null)}
          onEdit={() => {
            const item = orderedItems.find((i) => i.id === viewingId);
            if (item) { setEditingItem(item); setShowForm(true); setViewingId(null); }
          }}
          canEdit={canEdit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Manual</h1>
          <p className="text-sm text-gray-500">Manual da cultura e guias de referência.</p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => { setEditingItem(null); setShowForm(true); }}>
            <IconPlus className="size-4 mr-1" /> Nova página
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
        <Input
          placeholder="Buscar no manual..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Limpar busca">
            <IconX className="size-3.5" />
          </button>
        )}
      </div>

      <ManualItemList
        isLoading={isLoading}
        error={error}
        orderedItems={orderedItems}
        filteredItems={filteredItems}
        searching={!!search.trim()}
        canEdit={canEdit}
        onReorder={handleReorder}
        onView={(i) => setViewingId(i.id)}
        onEdit={(i) => { setEditingItem(i); setShowForm(true); }}
        onDelete={(i) => setDeletingItem(i)}
        onClearSearch={() => setSearch("")}
        onNewItem={() => { setEditingItem(null); setShowForm(true); }}
        onRetry={() => refetch()}
      />

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
        description="Esta ação não pode ser desfeita."
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
