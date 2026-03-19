"use client";

import { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";
import type { TeamPayrollEntry } from "@/features/financeiro/services/team-payroll";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  entries: TeamPayrollEntry[];
  totalFolha: number;
  month: string;
  onUpdate: (id: string, updates: Partial<Pick<TeamPayrollEntry, "name" | "role" | "section" | "salary">>) => void;
  onDelete: (id: string) => void;
  onAdd: (entry: { month: string; name: string; role: string; section: "equipe" | "vendas" | "outros"; salary: number }) => void;
}

type EditingField = { id: string; field: string } | null;

const SECTION_LABELS: Record<string, string> = {
  equipe: "Equipe",
  vendas: "Vendas",
  outros: "Outros",
};

const SECTION_STYLES: Record<string, string> = {
  vendas: "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-800 dark:bg-blue-950",
  equipe: "text-indigo-700 border-indigo-300 bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:bg-indigo-950",
  outros: "text-slate-700 border-slate-300 bg-slate-50 dark:text-slate-300 dark:border-slate-800 dark:bg-slate-950",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PayrollTable({ entries, totalFolha, month, onUpdate, onDelete, onAdd }: Props) {
  const [editing, setEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<{ name: string; role: string; section: "equipe" | "vendas" | "outros"; salary: string }>({ name: "", role: "", section: "equipe", salary: "" });

  const sorted = entries
    .filter((e) => e.is_active && e.salary > 0)
    .sort((a, b) => Number(b.salary) - Number(a.salary));

  function startEdit(id: string, field: string, currentValue: string | number) {
    setEditing({ id, field });
    setEditValue(String(currentValue));
  }

  function commitEdit() {
    if (!editing) return;
    const { id, field } = editing;
    const entry = entries.find((e) => e.id === id);
    if (!entry) { setEditing(null); return; }

    if (field === "salary") {
      const num = parseFloat(editValue.replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isNaN(num) && num !== Number(entry.salary)) {
        onUpdate(id, { salary: num });
      }
    } else if (field === "name" && editValue.trim() && editValue.trim() !== entry.name) {
      onUpdate(id, { name: editValue.trim() });
    } else if (field === "role" && editValue.trim() !== entry.role) {
      onUpdate(id, { role: editValue.trim() });
    }
    setEditing(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(null);
  }

  function handleSectionChange(id: string, value: string) {
    onUpdate(id, { section: value as "equipe" | "vendas" | "outros" });
  }

  function submitNewEntry() {
    const salary = parseFloat(newEntry.salary.replace(/[^\d.,]/g, "").replace(",", "."));
    if (!newEntry.name.trim() || isNaN(salary) || salary <= 0) return;
    onAdd({ month, name: newEntry.name.trim(), role: newEntry.role.trim(), section: newEntry.section, salary });
    setNewEntry({ name: "", role: "", section: "equipe", salary: "" });
    setAdding(false);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Colaborador</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Area</TableHead>
            <TableHead className="text-right">Salario</TableHead>
            <TableHead className="text-right">% Folha</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((m) => (
            <TableRow key={m.id}>
              {/* Name */}
              <TableCell
                className="font-medium cursor-pointer hover:bg-muted/50 rounded transition-colors"
                onClick={() => startEdit(m.id, "name", m.name)}
              >
                {editing?.id === m.id && editing.field === "name" ? (
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-sm"
                  />
                ) : (
                  m.name
                )}
              </TableCell>

              {/* Role */}
              <TableCell
                className="text-muted-foreground cursor-pointer hover:bg-muted/50 rounded transition-colors"
                onClick={() => startEdit(m.id, "role", m.role)}
              >
                {editing?.id === m.id && editing.field === "role" ? (
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-sm"
                  />
                ) : (
                  m.role || "\u2014"
                )}
              </TableCell>

              {/* Section */}
              <TableCell>
                <Select value={m.section} onValueChange={(v) => handleSectionChange(m.id, v)}>
                  <SelectTrigger className="h-7 w-[100px] text-xs border-0 p-0">
                    <Badge variant="outline" className={SECTION_STYLES[m.section] ?? SECTION_STYLES.outros}>
                      <SelectValue />
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipe">Equipe</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              {/* Salary */}
              <TableCell
                className="text-right text-rose-600 dark:text-rose-400 font-medium cursor-pointer hover:bg-muted/50 rounded transition-colors"
                onClick={() => startEdit(m.id, "salary", Number(m.salary))}
              >
                {editing?.id === m.id && editing.field === "salary" ? (
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-sm text-right w-28 ml-auto"
                  />
                ) : (
                  fmt(Number(m.salary))
                )}
              </TableCell>

              {/* % */}
              <TableCell className="text-right text-muted-foreground">
                {totalFolha > 0 ? fmtPct((Number(m.salary) / totalFolha) * 100) : "0%"}
              </TableCell>

              {/* Delete */}
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      title="Remover"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover colaborador</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{m.name}</strong> da folha? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(m.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}

          {/* Add new row */}
          {adding && (
            <TableRow>
              <TableCell>
                <Input
                  autoFocus
                  placeholder="Nome"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && submitNewEntry()}
                  className="h-7 text-sm"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Cargo"
                  value={newEntry.role}
                  onChange={(e) => setNewEntry((p) => ({ ...p, role: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && submitNewEntry()}
                  className="h-7 text-sm"
                />
              </TableCell>
              <TableCell>
                <Select value={newEntry.section} onValueChange={(v) => setNewEntry((p) => ({ ...p, section: v as "equipe" | "vendas" | "outros" }))}>
                  <SelectTrigger className="h-7 text-xs w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipe">Equipe</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Input
                  placeholder="Salario"
                  value={newEntry.salary}
                  onChange={(e) => setNewEntry((p) => ({ ...p, salary: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && submitNewEntry()}
                  className="h-7 text-sm text-right w-28 ml-auto"
                />
              </TableCell>
              <TableCell />
              <TableCell>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-600" onClick={submitNewEntry}>
                    <IconCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAdding(false)}>
                    <IconX className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-medium">Total Folha</TableCell>
            <TableCell className="text-right text-rose-600 dark:text-rose-400 font-medium">
              {fmt(totalFolha)}
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>

      {!adding && (
        <div className="mt-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAdding(true)}>
            <IconPlus className="h-3.5 w-3.5 mr-1" />
            Adicionar colaborador
          </Button>
        </div>
      )}
    </>
  );
}
