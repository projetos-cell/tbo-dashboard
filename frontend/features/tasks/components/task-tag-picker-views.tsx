"use client";

import { IconCheck, IconPlus } from "@tabler/icons-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Tag } from "@/schemas/tag";

// ─── Tag color palette ─────────────────────────────

export const TAG_COLORS = [
  { id: "red", hex: "#EF4444", label: "Vermelho" },
  { id: "orange", hex: "#F97316", label: "Laranja" },
  { id: "amber", hex: "#F59E0B", label: "Âmbar" },
  { id: "green", hex: "#22C55E", label: "Verde" },
  { id: "teal", hex: "#14B8A6", label: "Teal" },
  { id: "blue", hex: "#3B82F6", label: "Azul" },
  { id: "indigo", hex: "#6366F1", label: "Índigo" },
  { id: "purple", hex: "#A855F7", label: "Roxo" },
  { id: "pink", hex: "#EC4899", label: "Rosa" },
  { id: "gray", hex: "#6B7280", label: "Cinza" },
  { id: "brand", hex: "#E85102", label: "TBO" },
  { id: "dark", hex: "#1F2937", label: "Escuro" },
] as const;

// ─── Search view ───────────────────────────────────

export interface SearchViewProps {
  search: string;
  onSearchChange: (v: string) => void;
  orgTags: Tag[];
  taskTagIds: Set<string>;
  showCreateOption: boolean;
  onToggle: (tag: Tag) => void;
  onOpenCreate: () => void;
}

export function SearchView({
  search,
  onSearchChange,
  orgTags,
  taskTagIds,
  showCreateOption,
  onToggle,
  onOpenCreate,
}: SearchViewProps) {
  return (
    <Command>
      <CommandInput
        placeholder="Buscar tag..."
        value={search}
        onValueChange={onSearchChange}
      />
      <CommandList>
        <CommandEmpty>
          {!search && orgTags.length === 0
            ? "Nenhuma tag criada ainda"
            : "Nenhuma tag encontrada"}
        </CommandEmpty>

        {orgTags.length > 0 && (
          <CommandGroup heading="Tags da organização">
            {orgTags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name}
                onSelect={() => onToggle(tag)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: tag.color ?? "#6B7280" }}
                />
                <span className="flex-1 text-sm">{tag.name}</span>
                {taskTagIds.has(tag.id) && (
                  <IconCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {showCreateOption && (
          <>
            {orgTags.length > 0 && <CommandSeparator />}
            <CommandGroup>
              <CommandItem
                value={`__create__${search}`}
                onSelect={onOpenCreate}
                className="flex items-center gap-2 cursor-pointer text-primary"
              >
                <IconPlus className="h-3.5 w-3.5 shrink-0" />
                <span className="text-sm">
                  Criar tag: <strong>&ldquo;{search}&rdquo;</strong>
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}

// ─── Create view ───────────────────────────────────

export interface CreateViewProps {
  newName: string;
  newColor: string;
  isPending: boolean;
  onNameChange: (v: string) => void;
  onColorChange: (hex: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export function CreateView({
  newName,
  newColor,
  isPending,
  onNameChange,
  onColorChange,
  onCancel,
  onCreate,
}: CreateViewProps) {
  return (
    <div className="p-3 space-y-3">
      <p className="text-sm font-medium">Nova tag</p>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Nome</label>
        <Input
          value={newName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nome da tag"
          className="h-8 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onCreate();
            if (e.key === "Escape") onCancel();
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Cor</label>
        <div className="grid grid-cols-6 gap-1.5">
          {TAG_COLORS.map((c) => (
            <button
              key={c.id}
              title={c.label}
              type="button"
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                newColor === c.hex
                  ? "border-foreground scale-110"
                  : "border-transparent"
              )}
              style={{ backgroundColor: c.hex }}
              onClick={() => onColorChange(c.hex)}
            />
          ))}
        </div>
      </div>

      {newName.trim() && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Prévia:</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
            style={{
              backgroundColor: newColor + "22",
              color: newColor,
              borderColor: newColor + "44",
            }}
          >
            {newName}
          </span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs"
          disabled={!newName.trim() || isPending}
          onClick={onCreate}
        >
          {isPending ? "Criando..." : "Criar"}
        </Button>
      </div>
    </div>
  );
}
