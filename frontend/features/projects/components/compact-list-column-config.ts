import {
  IconAlignLeft,
  IconHash,
  IconSelect,
  IconList,
  IconLoader,
  IconCalendar,
  IconUsers,
  IconPaperclip,
  IconCheckbox,
  IconLink,
  IconAt,
  IconPhone,
  IconCornerDownRight,
  IconSearch,
  IconMathFunction,
  IconId,
  IconMapPin,
  IconClock,
  IconUserCircle,
} from "@tabler/icons-react";
import type { SortField } from "./compact-list-helpers";

// ─── Fixed columns ────────────────────────────────────────────────────────────

export interface ColumnConfig {
  id: SortField;
  label: string;
  width: string;
  defaultWidth: number;
  minWidth: number;
  sortable: boolean;
  hideOnMobile?: boolean;
  flex?: boolean;
  resizable?: boolean;
}

export const COLUMNS: ColumnConfig[] = [
  { id: "code", label: "Codigo", width: "w-[90px]", defaultWidth: 90, minWidth: 60, sortable: true },
  { id: "name", label: "Nome", width: "flex-1 min-w-[200px]", defaultWidth: 200, minWidth: 200, sortable: true, flex: true },
  { id: "status", label: "Status", width: "w-[130px]", defaultWidth: 130, minWidth: 80, sortable: true, resizable: true },
  { id: "construtora", label: "Construtora", width: "w-[160px]", defaultWidth: 160, minWidth: 80, sortable: true, hideOnMobile: true, resizable: true },
  { id: "owner", label: "Responsavel", width: "w-[140px]", defaultWidth: 140, minWidth: 80, sortable: true, hideOnMobile: true, resizable: true },
  { id: "due_date", label: "Prazo", width: "w-[120px]", defaultWidth: 120, minWidth: 80, sortable: true, hideOnMobile: true, resizable: true },
];

// ─── Extra column definition ─────────────────────────────────────────────────

export interface ExtraColumn {
  id: string;
  label: string;
  field: string;
  type: "text" | "date" | "number" | "select" | "url" | "email" | "checkbox" | "readonly";
  icon: typeof IconAlignLeft;
  width: string;
}

export const SUGGESTED_COLUMNS: ExtraColumn[] = [
  { id: "notes", label: "Descricao", field: "notes", type: "text", icon: IconAlignLeft, width: "w-[180px]" },
  { id: "due_date_start", label: "Data de Inicio", field: "due_date_start", type: "date", icon: IconCalendar, width: "w-[130px]" },
  { id: "due_date_end_extra", label: "Data de Termino", field: "due_date_end", type: "date", icon: IconCalendar, width: "w-[130px]" },
  { id: "priority", label: "Prioridade", field: "priority", type: "text", icon: IconSelect, width: "w-[120px]" },
];

export const TYPE_TO_COLUMN: Record<string, Omit<ExtraColumn, "id">> = {
  text: { label: "Texto", field: "notes", type: "text", icon: IconAlignLeft, width: "w-[180px]" },
  number: { label: "Valor", field: "value", type: "number", icon: IconHash, width: "w-[120px]" },
  select: { label: "Prioridade", field: "priority", type: "text", icon: IconSelect, width: "w-[120px]" },
  status: { label: "Status Secundario", field: "custom", type: "text", icon: IconLoader, width: "w-[130px]" },
  date: { label: "Data de Inicio", field: "due_date_start", type: "date", icon: IconCalendar, width: "w-[130px]" },
  person: { label: "Responsavel", field: "owner_name", type: "select", icon: IconUsers, width: "w-[140px]" },
  files: { label: "Arquivos", field: "custom", type: "readonly", icon: IconPaperclip, width: "w-[120px]" },
  checkbox: { label: "Verificacao", field: "custom", type: "checkbox", icon: IconCheckbox, width: "w-[100px]" },
  url: { label: "URL", field: "notion_url", type: "url", icon: IconLink, width: "w-[160px]" },
  email: { label: "E-mail", field: "custom", type: "email", icon: IconAt, width: "w-[160px]" },
  phone: { label: "Telefone", field: "custom", type: "text", icon: IconPhone, width: "w-[130px]" },
  relation: { label: "Relacao", field: "custom", type: "readonly", icon: IconCornerDownRight, width: "w-[140px]" },
  rollup: { label: "Rollup", field: "custom", type: "readonly", icon: IconSearch, width: "w-[120px]" },
  formula: { label: "Formula", field: "custom", type: "readonly", icon: IconMathFunction, width: "w-[120px]" },
  id: { label: "ID", field: "code", type: "readonly", icon: IconId, width: "w-[100px]" },
  location: { label: "Local", field: "custom", type: "text", icon: IconMapPin, width: "w-[140px]" },
  created_at: { label: "Criado em", field: "created_at", type: "readonly", icon: IconClock, width: "w-[130px]" },
  updated_at: { label: "Ultima edicao", field: "updated_at", type: "readonly", icon: IconClock, width: "w-[130px]" },
  created_by: { label: "Criado por", field: "owner_name", type: "readonly", icon: IconUserCircle, width: "w-[140px]" },
  updated_by: { label: "Ultima edicao por", field: "custom", type: "readonly", icon: IconUserCircle, width: "w-[140px]" },
  multi_select: { label: "Tags", field: "bus", type: "readonly", icon: IconList, width: "w-[140px]" },
};

// ─── Property types for "+" menu ─────────────────────────────────────────────

export const PROPERTY_TYPES_SUGGESTED = [
  { icon: IconAlignLeft, label: "Descricao do Projeto", key: "notes" },
  { icon: IconCalendar, label: "Data de Inicio", key: "due_date_start" },
  { icon: IconCalendar, label: "Data de Termino", key: "due_date_end_extra" },
  { icon: IconSelect, label: "Prioridade", key: "priority" },
];

export const PROPERTY_TYPES = [
  { icon: IconAlignLeft, label: "Texto", type: "text" },
  { icon: IconHash, label: "Numero", type: "number" },
  { icon: IconSelect, label: "Selecionar", type: "select" },
  { icon: IconList, label: "Selecao multipla", type: "multi_select" },
  { icon: IconLoader, label: "Status", type: "status" },
  { icon: IconCalendar, label: "Data", type: "date" },
  { icon: IconUsers, label: "Pessoa", type: "person" },
  { icon: IconPaperclip, label: "Arquivos e midia", type: "files" },
  { icon: IconCheckbox, label: "Caixa de selecao", type: "checkbox" },
  { icon: IconLink, label: "URL", type: "url" },
  { icon: IconAt, label: "E-mail", type: "email" },
  { icon: IconPhone, label: "Telefone", type: "phone" },
  { icon: IconCornerDownRight, label: "Relacao", type: "relation" },
  { icon: IconSearch, label: "Rollup", type: "rollup" },
  { icon: IconMathFunction, label: "Formula", type: "formula" },
  { icon: IconId, label: "ID", type: "id" },
  { icon: IconMapPin, label: "Local", type: "location" },
  { icon: IconClock, label: "Criado em", type: "created_at" },
  { icon: IconClock, label: "Ultima edicao", type: "updated_at" },
  { icon: IconUserCircle, label: "Criado por", type: "created_by" },
  { icon: IconUserCircle, label: "Ultima edicao por", type: "updated_by" },
];
