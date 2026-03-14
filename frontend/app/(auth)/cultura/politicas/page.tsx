"use client";

import { useState, useMemo } from "react";
import { IconPlus, IconShield } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PolicyCard } from "@/features/cultura/components/policy-card";
import { PolicyForm, type PolicyFormData } from "@/features/cultura/components/policy-form";
import { PolicyDetail } from "@/features/cultura/components/policy-detail";
import {
  PolicyFilters,
  type PolicyFilterValues,
} from "@/features/cultura/components/policy-filters";
import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  useArchivePolicy,
  useDuplicatePolicy,
} from "@/features/cultura/hooks/use-policies";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorState, ConfirmDialog, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type PolicyRow = Database["public"]["Tables"]["policies"]["Row"];

export default function PoliticasPage() {
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  // Filters state
  const [filters, setFilters] = useState<PolicyFilterValues>({
    search: "",
    status: "",
    category: "",
    sort: "recent",
  });

  // Query with server-side filters (status, category, sort)
  const queryFilters = useMemo(
    () => ({
      status: filters.status || undefined,
      category: filters.category || undefined,
      sort: (filters.sort || "recent") as "recent" | "az" | "next_review" | "status",
    }),
    [filters.status, filters.category, filters.sort]
  );

  const { data: policies, isLoading, error, refetch } = usePolicies(queryFilters);

  // Client-side search filtering
  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    if (!filters.search.trim()) return policies;
    const q = filters.search.toLowerCase();
    return policies.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.summary && p.summary.toLowerCase().includes(q))
    );
  }, [policies, filters.search]);

  // Mutations
  const createPolicy = useCreatePolicy();
  const updatePolicy = useUpdatePolicy();
  const archivePolicy = useArchivePolicy();
  const duplicatePolicy = useDuplicatePolicy();

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [archivingPolicy, setArchivingPolicy] = useState<PolicyRow | null>(null);

  const handleSave = async (data: PolicyFormData) => {
    try {
      if (editingPolicy) {
        await updatePolicy.mutateAsync({
          id: editingPolicy.id,
          updates: {
            title: data.title,
            category: data.category,
            summary: data.summary,
            image_url: data.image_url || null,
            content_md: data.content_md,
            status: data.status,
            effective_date: data.effective_date || null,
            review_cycle_days: data.review_cycle_days,
          },
          editedBy: user?.id,
          changeNote: data.change_note,
        });
      } else {
        await createPolicy.mutateAsync({
          tenant_id: tenantId!,
          title: data.title,
          category: data.category,
          summary: data.summary,
          image_url: data.image_url || null,
          content_md: data.content_md,
          status: data.status,
          effective_date: data.effective_date || null,
          review_cycle_days: data.review_cycle_days,
          created_by: user?.id,
          updated_by: user?.id,
        });
      }
    } catch {
      // handled by mutation onError
    }
  };

  const handleArchive = (policy: PolicyRow) => {
    setArchivingPolicy(policy);
  };

  const handleDuplicate = async (policy: PolicyRow) => {
    if (!user?.id) return;
    try {
      await duplicatePolicy.mutateAsync({ id: policy.id, userId: user.id });
    } catch {
      // handled by mutation onError
    }
  };

  // Detail view
  if (viewingId) {
    return (
      <PolicyDetail
        policyId={viewingId}
        onBack={() => setViewingId(null)}
        onEdit={() => {
          const policy = policies?.find((p) => p.id === viewingId);
          if (policy) {
            setEditingPolicy(policy);
            setShowForm(true);
            setViewingId(null);
          }
        }}
        canEdit={canEdit}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Politicas</h1>
          <p className="text-sm text-gray-500">
            Politicas e diretrizes da organizacao.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            onClick={() => {
              setEditingPolicy(null);
              setShowForm(true);
            }}
          >
            <IconPlus className="size-4 mr-1" />
            Nova politica
          </Button>
        )}
      </div>

      {/* Filters */}
      <PolicyFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : filteredPolicies.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              canEdit={canEdit}
              onView={(p) => setViewingId(p.id)}
              onEdit={(p) => {
                setEditingPolicy(p);
                setShowForm(true);
              }}
              onArchive={handleArchive}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={IconShield}
          title="Nenhuma politica encontrada"
          description={filters.search || filters.status || filters.category
            ? "Tente ajustar os filtros."
            : "Crie politicas e diretrizes para a organizacao."}
          cta={!filters.search && !filters.status && !filters.category && canEdit
            ? { label: "Nova politica", onClick: () => { setEditingPolicy(null); setShowForm(true); } }
            : undefined}
        />
      )}

      <ConfirmDialog
        open={!!archivingPolicy}
        onOpenChange={(open) => !open && setArchivingPolicy(null)}
        title={`Arquivar "${archivingPolicy?.title}"?`}
        description="A politica nao sera mais exibida na listagem principal."
        confirmLabel="Arquivar"
        variant="default"
        onConfirm={async () => {
          try {
            if (archivingPolicy)
              await archivePolicy.mutateAsync({ id: archivingPolicy.id, userId: user?.id });
          } catch {
            // handled by mutation onError
          } finally {
            setArchivingPolicy(null);
          }
        }}
      />

      {/* Form modal */}
      <PolicyForm
        open={showForm}
        onOpenChange={setShowForm}
        policy={editingPolicy}
        onSave={handleSave}
        canPublish={canEdit}
        currentUserId={user?.id}
      />
    </div>
  );
}
