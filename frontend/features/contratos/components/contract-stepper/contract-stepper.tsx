"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconArrowLeft, IconArrowRight, IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
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
import { StepperHeader } from "./stepper-header";
import { StepBasics } from "./step-basics";
import { StepScope } from "./step-scope";
import { StepSigners } from "./step-signers";
import { StepDocument } from "./step-document";
import { StepReview } from "./step-review";
import { uploadContractFile } from "../../services/contracts";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  { label: "Dados Basicos", description: "Titulo, categoria, valor" },
  { label: "Escopo", description: "Itens e entregas" },
  { label: "Signatarios", description: "Quem assina" },
  { label: "Documento", description: "PDF do contrato" },
  { label: "Revisao", description: "Confirmar e criar" },
];

export function ContractStepper() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
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

  // Mutations
  const createContract = useCreateContract();
  const createScopeBatch = useCreateScopeItemsBatch();
  const createSignersBatch = useCreateContractSignersBatch();
  const sendToClicksign = useSendToClicksign();

  const updateBasics = useCallback(
    (updates: Partial<ContractBasicsInput>) => {
      setBasics((prev) => ({ ...prev, ...updates }));
      setErrors({});
    },
    []
  );

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
      // 1. Upload file if present
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let storagePath: string | null = null;

      if (file) {
        const supabase = createClient();
        const tempId = crypto.randomUUID();
        const uploadResult = await uploadContractFile(
          supabase,
          file,
          {
            contractId: tempId,
            title: basics.title,
            category: basics.category ?? "cliente",
          }
        );
        fileUrl = uploadResult.publicUrl;
        fileName = uploadResult.fileName;
        storagePath = uploadResult.storagePath;
      }

      // 2. Create contract
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

      // 3. Create scope items
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

      // 4. Create signers
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

      // 5. Optionally send to Clicksign if signers + document present
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

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <StepperHeader steps={STEPS} currentStep={currentStep} />

      <ScrollArea className="flex-1 px-1">
        <div className="pb-6">
          {currentStep === 0 && (
            <StepBasics
              data={basics}
              onChange={updateBasics}
              errors={errors}
            />
          )}
          {currentStep === 1 && (
            <StepScope items={scopeItems} onChange={setScopeItems} />
          )}
          {currentStep === 2 && (
            <StepSigners signers={signers} onChange={setSigners} />
          )}
          {currentStep === 3 && (
            <StepDocument file={file} onChange={setFile} />
          )}
          {currentStep === 4 && (
            <StepReview
              basics={basics}
              scopeItems={scopeItems}
              signers={signers}
              file={file}
            />
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={currentStep === 0 || isSubmitting}
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <IconLoader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <IconDeviceFloppy className="h-4 w-4 mr-1" />
              )}
              Criar Contrato
            </Button>
          ) : (
            <Button type="button" onClick={next}>
              Proximo
              <IconArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
