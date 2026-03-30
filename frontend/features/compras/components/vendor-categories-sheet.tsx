"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconGripVertical,
  IconTrash,
  IconPlus,
  IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  useVendorCategories,
  useCreateVendorCategory,
  useUpdateVendorCategory,
  useDeleteVendorCategory,
  useReorderVendorCategories,
} from "../hooks/use-compras";
import type { VendorCategory } from "../types";

interface SortableCategoryRowProps {
  category: VendorCategory;
  onEdit: (cat: VendorCategory) => void;
  onDelete: (cat: VendorCategory) => void;
  editingId: string | null;
  editingName: string;
  onEditingNameChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
  editingId,
  editingName,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
}: SortableCategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const isEditing = editingId === category.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background p-2",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <IconGripVertical className="size-4" />
      </button>

      {category.color && (
        <div
          className="size-3 rounded-full shrink-0"
          style={{ backgroundColor: category.color }}
        />
      )}

      {isEditing ? (
        <>
          <Input
            className="flex-1 h-7"
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            autoFocus
          />
          <Button size="icon" variant="ghost" className="size-7" onClick={onSaveEdit}>
            <IconCheck className="size-4 text-green-500" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={onCancelEdit}>
            <IconX className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{category.name}</span>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={() => onEdit(category)}
          >
            <IconPencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
          >
            <IconTrash className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

interface VendorCategoriesSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function VendorCategoriesSheet({ open, onOpenChange }: VendorCategoriesSheetProps) {
  const { toast } = useToast();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: categories = [] } = useVendorCategories();
  const createCategory = useCreateVendorCategory();
  const updateCategory = useUpdateVendorCategory();
  const deleteCategory = useDeleteVendorCategory();
  const reorder = useReorderVendorCategories();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<VendorCategory | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    reorder.mutate(reordered.map((c, i) => ({ id: c.id, sort_order: i })));
  };

  const handleCreate = async () => {
    if (!newName.trim() || !tenantId) return;
    try {
      await createCategory.mutateAsync({
        tenant_id: tenantId,
        name: newName.trim(),
        color: null,
        sort_order: categories.length,
      });
      setNewName("");
      toast({ title: "Categoria criada" });
    } catch {
      toast({ title: "Erro ao criar categoria", variant: "destructive" });
    }
  };

  const handleEdit = (cat: VendorCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id: editingId, updates: { name: editingName.trim() } });
      setEditingId(null);
      setEditingName("");
    } catch {
      toast({ title: "Erro ao atualizar categoria", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast({ title: "Categoria removida" });
    } catch {
      toast({ title: "Erro ao remover categoria", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Gerenciar Categorias</SheetTitle>
            <SheetDescription>
              Crie, edite e reordene categorias de fornecedores.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Add new */}
            <div className="flex gap-2">
              <Input
                placeholder="Nova categoria..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newName.trim() || createCategory.isPending}
              >
                <IconPlus className="size-4" />
              </Button>
            </div>

            {/* List */}
            {categories.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <SortableCategoryRow
                        key={cat.id}
                        category={cat}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                        editingId={editingId}
                        editingName={editingName}
                        onEditingNameChange={setEditingName}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>{deleteTarget?.name}</strong> será removida permanentemente.
              Os fornecedores com essa categoria não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
