"use client";

import { useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconTemplate,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useEmailTemplates } from "@/features/marketing/hooks/use-email-studio";

function TemplatesContent() {
  const [search, setSearch] = useState("");
  const { data: templates, isLoading, error, refetch } = useEmailTemplates();

  const filtered = (templates ?? []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates de Email</h1>
          <p className="text-sm text-muted-foreground">
            Biblioteca de templates reutilizaveis para campanhas de email.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Template
        </Button>
      </div>

      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar templates." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconTemplate}
          title={search ? "Nenhum template encontrado" : "Nenhum template ainda"}
          description={search ? "Tente ajustar a busca." : "Crie seu primeiro template de email para comecar."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:border-blue-400/40 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="h-24 rounded-md bg-muted/40 flex items-center justify-center">
                  <IconTemplate className="size-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-medium text-sm truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {template.category && (
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                  )}
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmailStudioTemplatesPage() {
  return (
    <RequireRole module="marketing">
      <TemplatesContent />
    </RequireRole>
  );
}
