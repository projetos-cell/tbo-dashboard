"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateContract } from "../../hooks/use-contracts";
import { useCreateScopeItemsBatch } from "../../hooks/use-contract-scope";
import { useCreateContractSignersBatch } from "../../hooks/use-contract-signers";
import { useSendToClicksign } from "../../hooks/use-clicksign";
import {
  ContractBasicsSchema,
  ScopeItemSchema,
  SignerSchema,
} from "../../schemas/contract-schemas";
import type {
  ContractBasicsInput,
  ScopeItemInput,
  SignerInput,
} from "../../schemas/contract-schemas";
import { uploadContractFile } from "../../services/contracts";
import { createClient } from "@/lib/supabase/client";

export const STEPS = [
  { label: "Dados Basicos", description: "Titulo, categoria, valor" },
  { label: "Escopo", description: "Itens e entregas" },
  { label: "Signatarios", description: "Quem assina" },
  { label: "Documento", description: "PDF do contrato" },
  { label: "Revisao", description: "Confirmar e criar" },
];

export function useContractStepper() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [basics, setBasics] = useState<ContractBasicsInput>({
    title: "",
    description: "",
    project_id: null,
    client_id: null,
    total_value: 0,
    start_date: null,
    end_date: null,
    category: "cliente",
    type: "pj",
  });
  const [scopeItems, setScopeItems] = useState<ScopeItemInput[]>([]);
  const [signers, setSigners] = useState<SignerInput[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createContract = useCreateContract();
  const createScopeBatch = useCreateScopeItemsBatch();
  const createSignersBatch = useCreateContractSignersBatch();
  const sendToClicksign = useSendToClicksign();

  const updateBasics = useCallback((updates: Partial<ContractBasicsInput>) => {
    setBasics((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const validateStep = useCallback((): boolean => {
    if (currentStep === 0) {
      const result = ContractBasicsSchema.safeParse(basics);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
        return false;
      }
    }

    if (currentStep === 1) {
      for (const item of scopeItems) {
        const result = ScopeItemSchema.safeParse(item);
        if (!result.success) {
          toast.error(
            `Item "${item.title || "sem titulo"}": ${result.error.issues[0].message}`
          );
          return false;
        }
      }
    }

    if (currentStep === 2) {
      for (const signer of signers) {
        const result = SignerSchema.safeParse(signer);
        if (!result.success) {
          toast.error(
            `Signatario "${signer.name || "sem nome"}": ${result.error.issues[0].message}`
          );
          return false;
        }
      }
    }

    return true;
  }, [currentStep, basics, scopeItems, signers]);

  const next = useCallback(() => {
    if (!validateStep()) return;
    setCurrentStep((i) => Math.min(i + 1, STEPS.length - 1));
  }, [validateStep]);

  const back = useCallback(() => {
    setCurrentStep((i) => Math.max(i - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!tenantId || !user?.id) {
      toast.error("Sessao expirada. Faca login novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let storagePath: string | null = null;

      if (file) {
        const supabase = createClient();
        const tempId = crypto.randomUUID();
        const uploadResult = await uploadContractFile(supabase, file, {
          contractId: tempId,
          title: basics.title,
          category: basics.category ?? "cliente",
        });
        fileUrl = uploadResult.publicUrl;
        fileName = uploadResult.fileName;
        storagePath = uploadResult.storagePath;
      }

      const contractData = {
        title: basics.title,
        description: basics.description ?? null,
        category: basics.category ?? "cliente",
        type: basics.type ?? "pj",
        status: "draft",
        total_value: basics.total_value,
        start_date: basics.start_date ?? null,
        end_date: basics.end_date ?? null,
        project_id: basics.project_id ?? null,
        client_id: basics.client_id ?? null,
        file_url: fileUrl,
        file_name: fileName,
        source_path: storagePath,
        tenant_id: tenantId,
        created_by: user.id,
        contract_status: "draft",
        clicksign_status: "draft",
      };

      const contract = await createContract.mutateAsync(contractData as never);
      const contractId = (contract as Record<string, unknown>).id as string;

      if (scopeItems.length > 0) {
        const scopeData = scopeItems.map((item, index) => ({
          contract_id: contractId,
          title: item.title,
          description: item.description ?? null,
          category: item.category ?? null,
          value: item.value ?? 0,
          status: "pending",
          progress_pct: 0,
          estimated_start: item.estimated_start ?? null,
          estimated_end: item.estimated_end ?? null,
          sort_order: index,
        }));
        await createScopeBatch.mutateAsync(scopeData as never);
      }

      if (signers.length > 0) {
        const signerData = signers.map((s) => ({
          contract_id: contractId,
          name: s.name,
          email: s.email,
          cpf: s.cpf || null,
          role: s.role,
          sign_status: "pending",
        }));
        await createSignersBatch.mutateAsync(signerData as never);
      }

      toast.success("Contrato criado com sucesso!");

      if (signers.length > 0 && file) {
        try {
          await sendToClicksign.mutateAsync(contractId);
        } catch {
          toast.info(
            "Contrato criado. Envio para Clicksign pode ser feito manualmente."
          );
        }
      }

      router.push(`/contratos/${contractId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar contrato";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    tenantId,
    user,
    file,
    basics,
    scopeItems,
    signers,
    createContract,
    createScopeBatch,
    createSignersBatch,
    sendToClicksign,
    router,
  ]);

  return {
    currentStep,
    isSubmitting,
    basics,
    scopeItems,
    signers,
    file,
    errors,
    updateBasics,
    setScopeItems,
    setSigners,
    setFile,
    next,
    back,
    handleSubmit,
    isLastStep: currentStep === STEPS.length - 1,
  };
}
