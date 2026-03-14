"use client";

import { use } from "react";
import { useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PolicyDetail } from "@/features/cultura/components/policy-detail";
import { PolicyForm, type PolicyFormData } from "@/features/cultura/components/policy-form";
import { usePolicy, useUpdatePolicy } from "@/features/cultura/hooks/use-policies";
import { useAuthStore } from "@/stores/auth-store";

interface PolicySlugPageProps {
  params: Promise<{ slug: string }>;
}

export default function PolicySlugPage({ params }: PolicySlugPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const { data: policy, isLoading } = usePolicy(slug);
  const updatePolicy = useUpdatePolicy();

  const [showForm, setShowForm] = useState(false);

  const handleSave = async (data: PolicyFormData) => {
    if (!policy) return;
    await updatePolicy.mutateAsync({
      id: policy.id,
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
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-[calc(100vh-16rem)] w-full rounded-lg" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Politica nao encontrada.</p>
        <Button
          variant="link"
          onClick={() => router.push("/cultura/politicas")}
          className="mt-2"
        >
          <IconArrowLeft className="size-4 mr-1" />
          Voltar para politicas
        </Button>
      </div>
    );
  }

  return (
    <>
      <PolicyDetail
        policyId={policy.id}
        onBack={() => router.push("/cultura/politicas")}
        onEdit={() => setShowForm(true)}
        canEdit={canEdit}
      />

      <PolicyForm
        open={showForm}
        onOpenChange={setShowForm}
        policy={policy}
        onSave={handleSave}
        canPublish={canEdit}
      />
    </>
  );
}
