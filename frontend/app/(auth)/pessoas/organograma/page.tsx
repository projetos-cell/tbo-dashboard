"use client";

import { useState, useCallback } from "react";
import { useOrgChart } from "@/features/people/hooks/use-org-chart";
import { OrgChart } from "@/features/people/components/org-chart";
import { PersonDetail } from "@/features/people/components/person-detail";
import { usePersonById } from "@/features/people/hooks/use-person-by-id";
import { ErrorState } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function OrganogramaPage() {
  const { data, isLoading, error, refetch } = useOrgChart();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: selectedPerson } = usePersonById(selectedPersonId);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedPersonId(nodeId);
    setDetailOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organograma</h1>
        <p className="text-sm text-gray-500">
          Visualize a estrutura hierárquica da equipe TBO.
        </p>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" style={{ marginLeft: i * 24 }} />
            ))}
          </div>
        </div>
      ) : data ? (
        <OrgChart tree={data.tree} flat={data.flat} onNodeClick={handleNodeClick} />
      ) : null}

      {/* Person detail sheet */}
      <PersonDetail
        person={selectedPerson ?? null}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedPersonId(null);
        }}
      />
    </div>
  );
}
