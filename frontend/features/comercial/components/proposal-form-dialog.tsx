"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProposalRow } from "@/features/comercial/services/proposals";

interface FormValues {
  name: string;
  client: string;
  company: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  project_type: string;
  project_location: string;
  valid_days: string;
  notes: string;
  introduction: string;
  show_d3d_flow: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: ProposalRow | null;
  onSubmit: (values: Omit<FormValues, "valid_days"> & { valid_days: number; show_d3d_flow: boolean }) => void;
  isPending: boolean;
}

const PROJECT_TYPES = [
  "Residencial Alto Padrão",
  "Residencial Médio Padrão",
  "Residencial Econômico",
  "Comercial",
  "Misto",
  "Loteamento",
  "Hotel / Resort",
  "Outro",
];

export function ProposalFormDialog({ open, onOpenChange, proposal, onSubmit, isPending }: Props) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      name: "", client: "", company: "", contact_name: "",
      contact_email: "", contact_phone: "", project_type: "",
      project_location: "", valid_days: "30", notes: "",
      introduction: "", show_d3d_flow: false,
    },
  });

  useEffect(() => {
    if (proposal) {
      reset({
        name: proposal.name,
        client: proposal.client ?? "",
        company: proposal.company ?? "",
        contact_name: proposal.contact_name ?? "",
        contact_email: proposal.contact_email ?? "",
        contact_phone: proposal.contact_phone ?? "",
        project_type: proposal.project_type ?? "",
        project_location: proposal.project_location ?? "",
        valid_days: String(proposal.valid_days ?? 30),
        notes: proposal.notes ?? "",
        introduction: proposal.introduction ?? "",
        show_d3d_flow: proposal.show_d3d_flow ?? false,
      });
    } else {
      reset({
        name: "", client: "", company: "", contact_name: "",
        contact_email: "", contact_phone: "", project_type: "",
        project_location: "", valid_days: "30", notes: "",
        introduction: "", show_d3d_flow: false,
      });
    }
  }, [proposal, reset]);

  function handleFormSubmit(values: FormValues) {
    onSubmit({ ...values, valid_days: parseInt(values.valid_days) || 30 });
  }

  const projectType = watch("project_type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{proposal ? "Editar Proposta" : "Nova Proposta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Dados do Projeto */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Empreendimento
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Nome do Empreendimento *</Label>
                <Input placeholder="Ex: Edifício Solaris" {...register("name", { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tipologia</Label>
                  <Select value={projectType} onValueChange={(v) => setValue("project_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Localização</Label>
                  <Input placeholder="Ex: Ecoville — Curitiba, PR" {...register("project_location")} />
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Cliente
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Empresa</Label>
                  <Input placeholder="Ex: Construtora Horizonte" {...register("company")} />
                </div>
                <div>
                  <Label className="text-xs">Contato</Label>
                  <Input placeholder="Nome do contato" {...register("contact_name")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">E-mail</Label>
                  <Input type="email" placeholder="contato@empresa.com" {...register("contact_email")} />
                </div>
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input placeholder="(41) 9 9999-9999" {...register("contact_phone")} />
                </div>
              </div>
            </div>
          </div>

          {/* Condições */}
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Condições
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Validade (dias)</Label>
                <Input type="number" min={1} max={365} {...register("valid_days")} />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Observações / Condições Comerciais</Label>
              <Textarea rows={3} placeholder="Forma de pagamento, prazos, condições especiais..." {...register("notes")} />
            </div>
          </div>

          {/* Proposta Interativa */}
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Proposta Interativa
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Incluir fluxo D3D</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Exibe processo, timeline, diferenciais TBO e upsell na proposta pública
                  </p>
                </div>
                <Switch
                  checked={watch("show_d3d_flow")}
                  onCheckedChange={(v) => setValue("show_d3d_flow", v)}
                />
              </div>
              <div>
                <Label className="text-xs">Texto de Apresentação</Label>
                <Textarea
                  rows={4}
                  placeholder="Contexto estratégico do projeto — por que estas imagens, qual a lógica comercial..."
                  {...register("introduction")}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Aparece antes do escopo na proposta pública. Use para justificar o &quot;porquê&quot; antes do &quot;quanto&quot;.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : proposal ? "Salvar" : "Criar Proposta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
