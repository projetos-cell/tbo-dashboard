"use client";

import React, { useState, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconPlus,
  IconSearch,
  IconGripVertical,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconTag,
} from "@tabler/icons-react";
import { PageHeader, EmptyState } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import {
  useVendors,
  useVendorCategories,
  useUpdateVendor,
  useDeleteVendor,
} from "@/features/compras/hooks/use-compras";
import { VendorForm } from "@/features/compras/components/vendor-form";
import { VendorCategoriesSheet } from "@/features/compras/components/vendor-categories-sheet";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/features/compras/types";

type GroupBy = "category" | "status" | "none";

interface SortableVendorRowProps {
  vendor: Vendor;
  categories: { id: string; name: string }[];
  onEdit: (v: Vendor) => void;
  onDelete: (v: Vendor) => void;
  onToggleActive: (v: Vendor, active: boolean) => void;
}

function SortableVendorRow({
  vendor,
  categories,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableVendorRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: vendor.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const catName = vendor.category;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50 shadow-lg bg-muted")}
    >
      <TableCell className="w-8 pl-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground"
        >
          <IconGripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{vendor.name}</TableCell>
      <TableCell className="text-muted-foreground">{vendor.cnpj ?? "—"}</TableCell>
      <TableCell>
        {catName ? (
          <Badge variant="secondary">{catName}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{vendor.email ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">{vendor.phone ?? "—"}</TableCell>
      <TableCell>
        <Switch
          checked={vendor.is_active ?? true}
          onCheckedChange={(checked: boolean) => onToggleActive(vendor, checked)}
        />
      </TableCell>
      <TableCell className="text-right pr-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(vendor)}>
              <IconPencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(vendor)}
            >
              <IconTrash className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function VendorGroup({
  label,
  vendors,
  categories,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  label: string;
  vendors: Vendor[];
  categories: { id: string; name: string }[];
  onEdit: (v: Vendor) => void;
  onDelete: (v: Vendor) => void;
  onToggleActive: (v: Vendor, active: boolean) => void;
}) {
  return (
    <>
      <TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableCell colSpan={8} className="py-1.5 pl-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label} ({vendors.length})
        </TableCell>
      </TableRow>
      {vendors.map((v) => (
        <SortableVendorRow
          key={v.id}
          vendor={v}
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </>
  );
}

export default function FornecedoresPage() {
  const { toast } = useToast();
  const { data: vendors = [] as Vendor[], isLoading } = useVendors();
  const { data: categories = [] as { id: string; name: string }[] } = useVendorCategories();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("_all");
  const [filterActive, setFilterActive] = useState("_all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [formOpen, setFormOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const handleSetDeleteTarget = (v: Vendor) => setDeleteTarget(v);

  const sensors = useSensors(useSensor(PointerSensor));

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.cnpj ?? "").includes(search) ||
        (v.email ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        filterCategory === "_all" || v.category === filterCategory;
      const matchActive =
        filterActive === "_all" ||
        (filterActive === "active" ? v.is_active !== false : v.is_active === false);
      return matchSearch && matchCategory && matchActive;
    });
  }, [vendors, search, filterCategory, filterActive]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const groups = new Map<string, Vendor[]>();
    for (const v of filtered) {
      const key =
        groupBy === "category"
          ? (v.category ?? "Sem categoria")
          : (v.is_active !== false ? "Ativo" : "Inativo");
      const arr = groups.get(key) ?? [];
      arr.push(v);
      groups.set(key, arr);
    }
    return groups;
  }, [filtered, groupBy]);

  const handleDragEnd = (event: DragEndEvent) => {
    // DnD is visual-only when groupBy is active; only reorder in flat mode
    if (groupBy !== "none") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Reorder is optimistic in the UI but requires sort_order in DB
    // Trigger update for each affected vendor
    const oldIndex = filtered.findIndex((v) => v.id === active.id);
    const newIndex = filtered.findIndex((v) => v.id === over.id);
    arrayMove(filtered, oldIndex, newIndex); // visual hint already handled by DnD kit
  };

  const handleToggleActive = (vendor: Vendor, active: boolean) => {
    updateVendor.mutate({ id: vendor.id, updates: { is_active: active } });
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVendor.mutateAsync(deleteTarget.id);
      toast({ title: "Fornecedor excluído" });
    } catch {
      toast({ title: "Erro ao excluir fornecedor", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const uniqueCategories = useMemo(
    () => [...new Set(vendors.map((v) => v.category).filter(Boolean))] as string[],
    [vendors]
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Fornecedores"
        description="Gerencie todos os fornecedores da empresa."
        actions={
          <>
            <Button variant="outline" onClick={() => setCatSheetOpen(true)}>
              <IconTag className="mr-1.5 size-4" />
              Categorias
            </Button>
            <Button
              onClick={() => {
                setEditingVendor(null);
                setFormOpen(true);
              }}
            >
              <IconPlus className="mr-1.5 size-4" />
              Novo Fornecedor
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor..."
            className="pl-9"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas as categorias</SelectItem>
            {uniqueCategories.map((cat: string) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Agrupar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem agrupamento</SelectItem>
            <SelectItem value="category">Por categoria</SelectItem>
            <SelectItem value="status">Por status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="Nenhum fornecedor encontrado"
          description="Tente ajustar os filtros ou cadastre um novo fornecedor."
          cta={{
            label: "Novo Fornecedor",
            onClick: () => {
              setEditingVendor(null);
              setFormOpen(true);
            },
          }}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped ? (
                Array.from<[string, Vendor[]]>(grouped.entries()).map(([label, items]) => (
                  <VendorGroup
                    key={label}
                    label={label}
                    vendors={items}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleSetDeleteTarget}
                    onToggleActive={handleToggleActive}
                  />
                ))
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filtered.map((v) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filtered.map((v: Vendor) => (
                      <SortableVendorRow
                        key={v.id}
                        vendor={v}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleSetDeleteTarget}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <VendorForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingVendor(null);
        }}
        vendor={editingVendor}
      />

      <VendorCategoriesSheet open={catSheetOpen} onOpenChange={setCatSheetOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> será excluído permanentemente.
              Pedidos vinculados não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
