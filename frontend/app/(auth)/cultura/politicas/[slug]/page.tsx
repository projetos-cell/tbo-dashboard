"use client";

import { use } from "react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/tbo-ui/button";
import { Skeleton } from "@/components/tbo-ui/skeleton";
import { PolicyDetail } from "@/components/cultura/policy-detail";
import { PolicyForm, type PolicyFormData } from "@/components/cultura/policy-form";
import { usePolicy, useUpdatePolicy } from "@/hooks/use-policies";
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
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
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
          <ArrowLeft className="size-4 mr-1" />
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
