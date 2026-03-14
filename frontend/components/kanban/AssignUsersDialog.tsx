"use client";

import { useState } from "react";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamMembers } from "@/hooks/use-team";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AssignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with selected member IDs when user confirms. */
  onAssign?: (memberIds: string[]) => Promise<void> | void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssignUsersDialog({
  open,
  onOpenChange,
  onAssign,
}: AssignUsersDialogProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: members = [], isLoading } = useTeamMembers(
    { is_active: true },
  );

  const filtered = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleAssign() {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      if (onAssign) {
        await onAssign(Array.from(selected));
      }
      toast.success(
        `${selected.size} membro${selected.size > 1 ? "s" : ""} adicionado${selected.size > 1 ? "s" : ""} ao filtro`,
      );
      setSelected(new Set());
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atribuir membros. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setSelected(new Set());
    setSearch("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Atribuir membros</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-8"
          />
        </div>

        {/* User list */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {search ? "Nenhum membro encontrado" : "Equipe vazia"}
            </p>
          ) : (
            filtered.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => toggle(member.id)}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
              >
                <Checkbox
                  checked={selected.has(member.id)}
                  onCheckedChange={() => toggle(member.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {member.avatar_url && (
                    <AvatarImage src={member.avatar_url} alt={member.full_name ?? ""} />
                  )}
                  <AvatarFallback className="text-xs">
                    {(member.full_name ?? "?")
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm leading-tight font-medium truncate">
                    {member.full_name ?? "Sem nome"}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {member.email}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selected.size === 0 || saving}
          >
            {saving ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Atribuir{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
