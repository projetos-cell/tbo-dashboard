"use client";

import { useState } from "react";
import { useUsers, useUpdateUserRole } from "@/features/configuracoes/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconUsers, IconSearch, IconUserCheck, IconUserOff } from "@tabler/icons-react";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "lider", label: "Líder" },
  { value: "colaborador", label: "Colaborador" },
] as const;

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  lider: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  colaborador: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function UserManagementSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3">
            <Skeleton className="h-7 w-8 mb-1" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({});

  if (isLoading) return <RBACGuard minRole="admin"><UserManagementSkeleton /></RBACGuard>;

  const activeUsers = users?.filter((u) => u.is_active) ?? [];
  const inactiveUsers = users?.filter((u) => !u.is_active) ?? [];

  const filtered = activeUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.full_name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false) ||
      (u.department?.toLowerCase().includes(q) ?? false) ||
      (u.bu?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalByRole = ROLES.map((r) => ({
    ...r,
    count: activeUsers.filter((u) => u.role === r.value).length,
  }));

  return (
    <RBACGuard minRole="admin">
    <div className="space-y-4">
      {/* Role KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {totalByRole.map((r) => (
          <Card key={r.value} className="p-3">
            <p className="text-2xl font-bold leading-none">{r.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.label}</p>
          </Card>
        ))}
      </div>

      {/* Active users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconUsers size={16} className="text-muted-foreground" />
            Membros ativos ({activeUsers.length})
          </CardTitle>
          <CardDescription>Gerencie os papéis dos membros da equipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou departamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* List */}
          <div className="divide-y">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nenhum membro encontrado.
              </p>
            )}
            {filtered.map((user) => {
              const initials = (user.full_name ?? "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const isCurrentUser = user.id === currentUserId;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs font-semibold bg-tbo-orange/10 text-tbo-orange">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.full_name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-xs text-muted-foreground font-normal">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {user.department && (
                      <Badge variant="outline" className="text-xs hidden sm:flex">
                        {user.department}
                      </Badge>
                    )}
                    {isCurrentUser ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role ?? "colaborador"]}`}
                      >
                        {ROLES.find((r) => r.value === user.role)?.label ?? user.role}
                      </span>
                    ) : (
                      <Select
                        value={roleOverrides[user.id] ?? user.role ?? "colaborador"}
                        onValueChange={(role) => {
                          setRoleOverrides((prev) => ({ ...prev, [user.id]: role }));
                          updateRole.mutate(
                            { userId: user.id, role },
                            {
                              onError: () => {
                                setRoleOverrides((prev) => {
                                  const next = { ...prev };
                                  delete next[user.id];
                                  return next;
                                });
                              },
                            }
                          );
                        }}
                        disabled={updateRole.isPending}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inactive users (collapsed summary) */}
      {inactiveUsers.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <IconUserOff size={14} />
              Inativos ({inactiveUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {inactiveUsers.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                >
                  <IconUserCheck size={12} />
                  {u.full_name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </RBACGuard>
  );
}
