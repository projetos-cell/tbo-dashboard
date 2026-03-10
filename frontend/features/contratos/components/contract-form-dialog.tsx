"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
} from "@/lib/constants";
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
  Upload,
  FileText,
  ImageIcon,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

// ─── Constants ────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPT_STRING = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

// ─── Zod Schema ───────────────────────────────────────────────────────
const contractSchema = z.object({
  title: z.string().min(1, "Titulo obrigatório"),
  description: z.string().optional(),
  type: z.string().min(1),
  category: z.string().min(1),
  status: z.string().min(1),
  person_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  monthly_value: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ContractRow | null;
  defaultCategory?: string;
}

function getEmptyForm(category?: string) {
  return {
    title: "",
    description: "",
    type: category === "equipe" ? "freelancer" : "pj",
    category: category ?? "cliente",
    status: "active",
    person_name: "",
    start_date: "",
    end_date: "",
    monthly_value: "",
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  return FileText;
}

// ─── Component ────────────────────────────────────────────────────────
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

  const [form, setForm] = useState(getEmptyForm(defaultCategory));
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContractFormData, string>>
  >({});

  // ── File state ────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const isEditing = !!contract;

  // ── Sync form with contract/open ──────────────────────────────────
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
        monthly_value:
          contract.monthly_value != null
            ? String(contract.monthly_value)
            : "",
      });
    } else {
      setForm(getEmptyForm(defaultCategory));
    }
    setErrors({});
    setFile(null);
    setFileError(null);
    setIsUploading(false);
  }, [contract, open, defaultCategory]);

  // ── File validation ───────────────────────────────────────────────
  const validateAndSetFile = useCallback((selectedFile: File | undefined) => {
    setFileError(null);
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`Arquivo excede ${MAX_FILE_SIZE / 1024 / 1024}MB. Selecione um menor.`);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setFileError("Formato não suportado. Envie PDF, JPG, PNG, DOC ou DOCX.");
      return;
    }

    setFile(selectedFile);
  }, []);

  // ── Drag & Drop handlers ──────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    },
    [validateAndSetFile]
  );

  // ── Form handlers ─────────────────────────────────────────────────
  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
    // Reset input so user can re-select same file if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile() {
    setFile(null);
    setFileError(null);
  }

  // ── Submit ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate form
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

      // ── Create or Update the contract record first ──────────────
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

      // ── Upload file if selected ─────────────────────────────────
      if (file && contractId) {
        const supabase = createClient();
        const uploadResult = await uploadContractFile(supabase, file, {
          contractId,
          title: form.title.trim(),
          category: form.category,
          personName: form.person_name || undefined,
        });

        // Patch the record with file URL + name
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
      const message =
        err instanceof Error ? err.message : "Erro desconhecido.";
      toast({
        title: "Erro ao salvar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  const isPending = createMut.isPending || updateMut.isPending || isUploading;
  const categoryLabel =
    CONTRACT_CATEGORY[form.category as keyof typeof CONTRACT_CATEGORY]?.label ??
    "Contrato";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contrato" : `Novo Contrato — ${categoryLabel}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome / Pessoa */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título / Objeto *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: Contrato Porto Batel"
                disabled={isPending}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="person_name">Responsável / PO</Label>
              <Input
                id="person_name"
                value={form.person_name}
                onChange={(e) => handleChange("person_name", e.target.value)}
                placeholder="Nome do responsável"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Tipo, Categoria, Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleChange("category", v)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_CATEGORY).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => handleChange("type", v)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_TYPE).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleChange("status", v)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_STATUS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor + Datas */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="monthly_value">Valor Mensal (R$)</Label>
              <Input
                id="monthly_value"
                type="number"
                step="0.01"
                value={form.monthly_value}
                onChange={(e) => handleChange("monthly_value", e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Término</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              placeholder="Observações sobre o contrato..."
              disabled={isPending}
            />
          </div>

          {/* ── Anexo de Arquivo ─────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>Anexo do Contrato</Label>

            {!file ? (
              /* ── Drop zone (sem arquivo selecionado) ──────────────── */
              <div
                role="button"
                tabIndex={0}
                onClick={() => !isPending && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isPending) fileInputRef.current?.click();
                  }
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                  relative flex flex-col items-center justify-center gap-2
                  rounded-md border-2 border-dashed p-6
                  transition-all duration-200 cursor-pointer
                  ${
                    isDragging
                      ? "border-[#f97316] bg-[#f97316]/5 scale-[1.01]"
                      : "border-border hover:border-[#f97316]/50 hover:bg-muted/30"
                  }
                  ${isPending ? "pointer-events-none opacity-50" : ""}
                  focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
                `}
              >
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    transition-colors duration-200
                    ${isDragging ? "bg-[#f97316]/10" : "bg-muted"}
                  `}
                >
                  <Upload
                    className={`h-5 w-5 transition-colors ${
                      isDragging ? "text-[#f97316]" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragging ? (
                      <span className="text-[#f97316]">Solte o arquivo aqui</span>
                    ) : (
                      <>
                        Arraste o arquivo ou{" "}
                        <span className="text-[#f97316] underline underline-offset-2">
                          clique para selecionar
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG, DOC ou DOCX · Máx. 5MB
                  </p>
                </div>
              </div>
            ) : (
              /* ── Arquivo selecionado (preview card) ──────────────── */
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/20 p-3 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f97316]/10">
                  {(() => {
                    const Icon = getFileIcon(file.type);
                    return <Icon className="h-5 w-5 text-[#f97316]" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!isPending && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    aria-label="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileInputChange}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />

            {/* File error */}
            {fileError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Existing file note (editing mode) */}
            {isEditing && contract?.file_url && !file && (
              <p className="text-xs text-muted-foreground">
                Arquivo atual:{" "}
                <a
                  href={contract.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f97316] underline underline-offset-2 hover:text-[#ea580c]"
                >
                  {contract.file_name ?? "Ver arquivo"}
                </a>
                {" "}— selecione um novo para substituir.
              </p>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
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
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
