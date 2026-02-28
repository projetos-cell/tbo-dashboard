"use client";

import { useUsers, useUpdateUserRole } from "@/hooks/use-settings";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "po", label: "PO" },
  { value: "member", label: "Membro" },
  { value: "cs", label: "CS" },
  { value: "freelancer", label: "Freelancer" },
] as const;

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  po: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  member: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cs: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  freelancer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const currentUserId = useAuthStore((s) => s.user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const activeUsers = users?.filter((u) => u.is_active) ?? [];
  const totalByRole = ROLES.map((r) => ({
    ...r,
    count: activeUsers.filter((u) => u.role === r.value).length,
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {totalByRole.map((r) => (
          <Card key={r.value} className="p-3">
            <p className="text-2xl font-bold">{r.count}</p>
            <p className="text-xs text-muted-foreground">{r.label}</p>
          </Card>
        ))}
      </div>

      {/* User table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membros ({activeUsers.length})
          </CardTitle>
          <CardDescription>Gerencie os papéis dos membros da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {activeUsers.map((user) => {
              const initials = (user.full_name ?? "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div key={user.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.bu && (
                      <Badge variant="outline" className="text-xs">
                        {user.bu}
                      </Badge>
                    )}
                    {user.id === currentUserId ? (
                      <Badge className={ROLE_COLORS[user.role ?? "member"]}>
                        {ROLES.find((r) => r.value === user.role)?.label ?? user.role}
                      </Badge>
                    ) : (
                      <Select
                        defaultValue={user.role ?? "member"}
                        onValueChange={(role) =>
                          updateRole.mutate({ userId: user.id, role })
                        }
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
    </div>
  );
}
