"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";
import { CONTRACT_CATEGORY } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCreateContract,
  useUpdateContract,
} from "@/features/contratos/hooks/use-contracts";
import { uploadContractFile } from "@/features/contratos/services/contracts";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";
import {
  ContractFormFields,
  contractSchema,
  getEmptyForm,
  type ContractFormData,
} from "./contract-form-fields";
import { ContractFileUpload } from "./contract-file-upload";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ContractRow | null;
  defaultCategory?: string;
}

export function ContractFormDialog({
  open,
  onOpenChange,
  contract,
  defaultCategory,
}: ContractFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMut = useCreateContract();
  const updateMut = useUpdateContract();
  const { toast } = useToast();

  const [form, setForm] = useState<ContractFormData>(getEmptyForm(defaultCategory));
  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!contract;

  useEffect(() => {
    if (contract) {
      setForm({
        title: contract.title ?? "",
        description: contract.description ?? "",
        type: contract.type ?? "pj",
        category: contract.category ?? "cliente",
        status: contract.status ?? "active",
        person_name: contract.person_name ?? "",
        start_date: contract.start_date ?? "",
        end_date: contract.end_date ?? "",
        monthly_value: contract.monthly_value != null ? String(contract.monthly_value) : "",
      });
    } else {
      setForm(getEmptyForm(defaultCategory));
    }
    setErrors({});
    setFile(null);
    setIsUploading(false);
  }, [contract, open, defaultCategory]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = contractSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContractFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContractFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    setIsUploading(true);

    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description || null,
        type: form.type,
        category: form.category,
        status: form.status,
        person_name: form.person_name || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
      };

      let contractId: string;

      if (isEditing && contract) {
        await updateMut.mutateAsync({
          id: contract.id,
          updates: payload as Database["public"]["Tables"]["contracts"]["Update"],
        });
        contractId = contract.id;
      } else {
        const created = await createMut.mutateAsync({
          ...payload,
          tenant_id: tenantId,
        } as Database["public"]["Tables"]["contracts"]["Insert"]);
        contractId = (created as unknown as { id: string }).id;
      }

      if (file && contractId) {
        const supabase = createClient();
        const uploadResult = await uploadContractFile(supabase, file, {
          contractId,
          title: form.title.trim(),
          category: form.category,
          personName: form.person_name || undefined,
        });
        await updateMut.mutateAsync({
          id: contractId,
          updates: {
            file_url: uploadResult.publicUrl,
            file_name: uploadResult.fileName,
          } as Database["public"]["Tables"]["contracts"]["Update"],
        });
      }

      toast({
        title: isEditing ? "Contrato atualizado" : "Contrato criado",
        description: file
          ? `"${form.title.trim()}" salvo com arquivo anexado.`
          : `"${form.title.trim()}" salvo com sucesso.`,
      });

      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  const isPending = createMut.isPending || updateMut.isPending || isUploading;
  const categoryLabel =
    CONTRACT_CATEGORY[form.category as keyof typeof CONTRACT_CATEGORY]?.label ?? "Contrato";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contrato" : `Novo Contrato — ${categoryLabel}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ContractFormFields
            form={form}
            errors={errors}
            isPending={isPending}
            onChange={handleChange}
          />
          <ContractFileUpload
            file={file}
            onFileChange={setFile}
            isPending={isPending}
            existingFileUrl={contract?.file_url}
            existingFileName={contract?.file_name}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#f97316] hover:bg-[#ea580c] text-white gap-2"
              disabled={isPending || !form.title.trim()}
            >
              {isPending && <IconLoader2 className="h-4 w-4 animate-spin" />}
              {isPending
                ? isUploading && file
                  ? "Enviando..."
                  : "Salvando..."
                : isEditing
                  ? "Salvar"
                  : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
