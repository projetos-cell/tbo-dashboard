"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdateBriefingStatus } from "@/features/clientes/hooks/use-creative-briefings";
import type { CreativeBriefingRow } from "@/features/clientes/services/creative-briefings";
import { toast } from "sonner";
import {
  IconEye,
  IconCheck,
  IconClipboardText,
  IconCopy,
  IconExternalLink,
} from "@tabler/icons-react";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  enviado: { label: "Enviado", variant: "default" },
  em_analise: { label: "Em Análise", variant: "outline" },
  aprovado: { label: "Aprovado", variant: "default" },
};

interface Props {
  briefing: CreativeBriefingRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ── Labels legíveis para os campos do formulário ── */
const FIELD_LABELS: Record<string, string> = {
  nome_empreendimento: "Nome do Empreendimento",
  incorporadora: "Incorporadora",
  endereco: "Endereço",
  bairro_cidade: "Bairro / Cidade",
  padrao: "Padrão",
  num_torres: "Nº Torres",
  total_unidades: "Total Unidades",
  tipologias: "Tipologias",
  area_privativa: "Área Privativa",
  previsao_lancamento: "Previsão Lançamento",
  vgv: "VGV",
  persona_principal: "Persona Principal",
  persona_secundaria: "Persona Secundária",
  faixa_renda: "Faixa de Renda",
  motivacao_compra: "Motivação de Compra",
  mais_valoriza: "Mais Valoriza",
  medo_objecao: "Medo / Objeção",
  diferencial_principal: "Diferencial Principal",
  diferenciais_tecnicos: "Diferenciais Técnicos",
  diferenciais_lazer: "Diferenciais Lazer",
  diferenciais_localizacao: "Diferenciais Localização",
  concorrentes: "Concorrentes",
  posicionamento: "Posicionamento",
  conceito: "Conceito / Mote",
  tom_voz: "Tom de Voz",
  referencias_visuais: "Referências Visuais",
  paleta_cores: "Paleta de Cores",
  estilo_foto_3d: "Estilo Foto / 3D",
  nao_queremos: "O que NÃO queremos",
  qtd_3d: "Qtd Imagens 3D",
  qtd_plantas: "Qtd Plantas",
  book_vendas: "Book de Vendas",
  folder_qtd: "Folder / Panfleto",
  tapume_metragem: "Tapume (metragem)",
  prazo_naming: "Prazo Naming",
  prazo_id_visual: "Prazo ID Visual",
  prazo_3ds: "Prazo 3Ds",
  prazo_graficos: "Prazo Gráficos",
  data_lancamento: "Data Lançamento",
  budget_marketing: "Budget Marketing",
  observacoes: "Observações",
};

const TOGGLE_FIELDS: Record<string, string> = {
  entrega_naming: "Naming",
  entrega_id_visual: "Identidade Visual",
  entrega_tour_360: "Tour 360°",
  entrega_video_teaser: "Vídeo Teaser",
  entrega_video_institucional: "Vídeo Institucional",
  entrega_implantacao: "Implantação",
  entrega_stand: "Stand / PDV",
  entrega_site: "Site / Landing",
  entrega_campanha: "Campanha Digital",
};

const SECTIONS = [
  {
    title: "Dados do Empreendimento",
    fields: [
      "nome_empreendimento",
      "incorporadora",
      "endereco",
      "bairro_cidade",
      "padrao",
      "num_torres",
      "total_unidades",
      "tipologias",
      "area_privativa",
      "previsao_lancamento",
      "vgv",
    ],
  },
  {
    title: "Público-Alvo",
    fields: [
      "persona_principal",
      "persona_secundaria",
      "faixa_renda",
      "motivacao_compra",
      "mais_valoriza",
      "medo_objecao",
    ],
  },
  {
    title: "O Produto",
    fields: [
      "diferencial_principal",
      "diferenciais_tecnicos",
      "diferenciais_lazer",
      "diferenciais_localizacao",
      "concorrentes",
      "posicionamento",
    ],
  },
  {
    title: "Direção Criativa",
    fields: [
      "conceito",
      "tom_voz",
      "referencias_visuais",
      "paleta_cores",
      "estilo_foto_3d",
      "nao_queremos",
    ],
  },
  {
    title: "Entregas",
    fields: [
      "qtd_3d",
      "qtd_plantas",
      "book_vendas",
      "folder_qtd",
      "tapume_metragem",
    ],
    toggles: true,
  },
  {
    title: "Prazos e Observações",
    fields: [
      "prazo_naming",
      "prazo_id_visual",
      "prazo_3ds",
      "prazo_graficos",
      "data_lancamento",
      "budget_marketing",
      "observacoes",
    ],
  },
];

export function BriefingDetailDialog({ briefing, open, onOpenChange }: Props) {
  const updateStatus = useUpdateBriefingStatus();

  if (!briefing) return null;

  const fd = briefing.form_data as Record<string, unknown>;
  const statusInfo = STATUS_MAP[briefing.status] ?? STATUS_MAP.enviado;

  function handleStatusChange(status: CreativeBriefingRow["status"]) {
    updateStatus.mutate(
      { id: briefing!.id, status },
      {
        onSuccess: () => toast.success(`Status atualizado para ${STATUS_MAP[status]?.label}`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleCopyLink() {
    const base = window.location.origin;
    const url = `${base}/briefing/${briefing!.slug}${briefing!.project_slug ? `?projeto=${briefing!.project_slug}&nome=${encodeURIComponent(briefing!.client_name)}` : ""}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl" side="right">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <IconClipboardText className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg">
                {briefing.client_name}
                {briefing.project_name && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    — {briefing.project_name}
                  </span>
                )}
              </SheetTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                {briefing.submitted_at && (
                  <span className="text-xs text-muted-foreground">
                    Enviado em{" "}
                    {new Date(briefing.submitted_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pb-4">
          {briefing.status === "enviado" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("em_analise")}
              disabled={updateStatus.isPending}
            >
              <IconEye className="mr-1.5 h-3.5 w-3.5" />
              Marcar Em Análise
            </Button>
          )}
          {(briefing.status === "enviado" || briefing.status === "em_analise") && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("aprovado")}
              disabled={updateStatus.isPending}
            >
              <IconCheck className="mr-1.5 h-3.5 w-3.5" />
              Aprovar
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleCopyLink}>
            <IconCopy className="mr-1.5 h-3.5 w-3.5" />
            Copiar Link
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const base = window.location.origin;
              window.open(
                `${base}/briefing/${briefing.slug}${briefing.project_slug ? `?projeto=${briefing.project_slug}` : ""}`,
                "_blank",
              );
            }}
          >
            <IconExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Ver Form
          </Button>
        </div>

        <Separator />

        {/* Conteúdo */}
        <ScrollArea className="h-[calc(100vh-220px)] pr-4 pt-4">
          <div className="space-y-6">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </h3>

                {/* Toggles de entregas */}
                {section.toggles && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {Object.entries(TOGGLE_FIELDS).map(([key, label]) => (
                      <Badge
                        key={key}
                        variant={fd[key] ? "default" : "secondary"}
                        className={fd[key] ? "bg-orange-500/20 text-orange-400" : "opacity-50"}
                      >
                        {fd[key] ? "✓" : "—"} {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Campos textuais */}
                <div className="space-y-2">
                  {section.fields.map((fieldKey) => {
                    const val = fd[fieldKey];
                    if (!val) return null;
                    return (
                      <div key={fieldKey} className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          {FIELD_LABELS[fieldKey] || fieldKey}
                        </p>
                        <p className="mt-0.5 text-sm whitespace-pre-wrap">
                          {String(val)}
                        </p>
                      </div>
                    );
                  })}

                  {/* Se nenhum campo preenchido na seção */}
                  {section.fields.every((f) => !fd[f]) && !section.toggles && (
                    <p className="text-xs italic text-muted-foreground">
                      Nenhuma informação preenchida nesta seção.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
