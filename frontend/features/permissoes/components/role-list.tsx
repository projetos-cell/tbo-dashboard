"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconUsers } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type RoleRow = Database["public"]["Tables"]["roles"]["Row"];

interface RoleListProps {
  roles: RoleRow[];
  isLoading: boolean;
  selectedRoleId: string | null;
  onSelect: (id: string) => void;
}

export function RoleList({ roles, isLoading, selectedRoleId, onSelect }: RoleListProps) {
  return (
    <div className="w-full md:w-72 shrink-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-3 pt-0">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <IconUsers className="mb-2 h-8 w-8 text-gray-500/50" />
              <p className="text-sm text-gray-500">Nenhuma role encontrada</p>
            </div>
          ) : (
            roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 ${
                  selectedRoleId === role.id ? "border-tbo-orange bg-gray-100" : "border-transparent"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: role.color || "#6b7280" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{role.name}</div>
                  <div className="truncate text-xs text-gray-500">{role.slug}</div>
                </div>
                <div className="flex items-center gap-1">
                  {role.is_system && (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      Sistema
                    </Badge>
                  )}
                  {role.is_default && (
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      Padrão
                    </Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
