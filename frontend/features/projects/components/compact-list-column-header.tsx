"use client";

import React from "react";
import {
  IconAlignLeft,
  IconArrowUp,
  IconArrowDown,
  IconInfoCircle,
  IconAdjustments,
  IconTransform,
  IconSparkles,
  IconFilter,
  IconSortAscending,
  IconLayoutRows,
  IconMathSymbols,
  IconSnowflake,
  IconEyeOff,
  IconBraces,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortField, SortDir } from "./compact-list-helpers";
import type { GroupField } from "./project-list-toolbar";
import type { ColumnConfig } from "./compact-list-column-config";
import { PROPERTY_TYPES } from "./compact-list-column-config";

export function ColumnHeaderMenu({
  column,
  sortField,
  sortDir,
  isWrapped,
  isFixed,
  onSort,
  onFilter,
  onGroup,
  onHide,
  onToggleWrap,
  onInsertLeft,
  onInsertRight,
  onDuplicate,
  onDelete,
  icon: Icon,
  children,
}: {
  column: ColumnConfig;
  sortField: SortField;
  sortDir: SortDir;
  isWrapped: boolean;
  isFixed: boolean;
  onSort: (field: SortField, dir: SortDir) => void;
  onFilter: (field: string, value: string) => void;
  onGroup: (field: GroupField) => void;
  onHide: () => void;
  onToggleWrap: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  icon?: typeof IconAlignLeft;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-0" sideOffset={4}>
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
          {Icon ? (
            <Icon className="size-4 text-muted-foreground" />
          ) : (
            <IconAlignLeft className="size-4 text-muted-foreground" />
          )}
          <span className="flex-1 text-sm font-medium">{column.label}</span>
          <button
            type="button"
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconInfoCircle className="size-4" />
          </button>
        </div>

        <div className="py-1">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconAdjustments className="size-4 text-muted-foreground" />
              Editar propriedade
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                Nome: {column.label}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconTransform className="size-4 text-muted-foreground" />
              Alterar tipo
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {PROPERTY_TYPES.slice(0, 10).map((pt) => (
                <DropdownMenuItem key={pt.type} className="flex items-center gap-2 text-sm">
                  <pt.icon className="size-4 text-muted-foreground" />
                  {pt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm">
            <IconSparkles className="size-4 text-muted-foreground" />
            Preenchimento automatico com IA
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={() => {
              if (column.id === "status") {
                onFilter("status", "em_andamento");
              }
            }}
          >
            <IconFilter className="size-4 text-muted-foreground" />
            Filtrar
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconSortAscending className="size-4 text-muted-foreground" />
              Ordenar
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm"
                onClick={() => onSort(column.id, "asc")}
              >
                <IconArrowUp className="size-3.5 text-muted-foreground" />
                Crescente (A-Z)
                {sortField === column.id && sortDir === "asc" && (
                  <span className="ml-auto text-xs text-muted-foreground">ativo</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm"
                onClick={() => onSort(column.id, "desc")}
              >
                <IconArrowDown className="size-3.5 text-muted-foreground" />
                Decrescente (Z-A)
                {sortField === column.id && sortDir === "desc" && (
                  <span className="ml-auto text-xs text-muted-foreground">ativo</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={() => {
              const groupableFields: SortField[] = ["status", "construtora"];
              if (groupableFields.includes(column.id)) {
                onGroup(column.id as GroupField);
              }
            }}
          >
            <IconLayoutRows className="size-4 text-muted-foreground" />
            Agrupar
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconMathSymbols className="size-4 text-muted-foreground" />
              Calcular
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              <DropdownMenuItem className="text-sm">Contar todos</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar valores</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar unicos</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar vazios</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar nao vazios</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">Porcentagem vazio</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Porcentagem nao vazio</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          <DropdownMenuItem disabled className="flex items-center gap-2 px-3 py-2 text-sm">
            <IconSnowflake className="size-4 text-muted-foreground" />
            Congelar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onHide}
          >
            <IconEyeOff className="size-4 text-muted-foreground" />
            Ocultar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onToggleWrap}
          >
            <IconBraces className="size-4 text-muted-foreground" />
            Encapsular conteudo
            {isWrapped && <span className="ml-auto text-xs text-muted-foreground">ativo</span>}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onInsertLeft}
          >
            <IconColumnInsertLeft className="size-4 text-muted-foreground" />
            Inserir a esquerda
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onInsertRight}
          >
            <IconColumnInsertRight className="size-4 text-muted-foreground" />
            Inserir a direita
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onDuplicate}
            disabled={isFixed}
          >
            <IconCopy className="size-4 text-muted-foreground" />
            Duplicar propriedade
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 focus:text-red-600"
            onClick={onDelete}
            disabled={isFixed}
          >
            <IconTrash className="size-4" />
            Excluir propriedade
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
