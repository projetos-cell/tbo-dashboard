import type { D3DStageConfig } from "./types";

// ── D3D Pipeline Stage Definitions ─────────────────────────────────
// Mapeamento completo do fluxo de produção de imagens 3D da TBO

export const D3D_STAGE_CONFIGS: D3DStageConfig[] = [
  {
    key: "00_briefing",
    type: "phase",
    label: "Briefing + Projeto Arq.",
    subtitle: "Kickoff",
    description:
      "Recebimento do projeto arquitetônico, briefing do cliente e alinhamento de expectativas visuais com a equipe.",
    estimatedDays: "1–2 dias",
    estimatedDaysNum: 2,
    color: "#E85102",
    tag: "input",
    owner: "Cliente + TBO",
    deliverables: [
      { icon: "◆", iconType: "ref", label: "Plantas / Cortes / Fachadas" },
      { icon: "◆", iconType: "ref", label: "Briefing de referências do cliente" },
      { icon: "◆", iconType: "ref", label: "Definição de câmeras / ângulos" },
    ],
  },
  {
    key: "01_direcao_visual",
    type: "phase",
    label: "Direção Visual",
    subtitle: "Referências + Conceito",
    description:
      "Captação de referências visuais, montagem de moodboard, definição de paleta de materiais, atmosfera, iluminação e enquadramentos.",
    estimatedDays: "2–3 dias",
    estimatedDaysNum: 3,
    color: "#3B82F6",
    tag: "producao",
    owner: "TBO",
    deliverables: [
      { icon: "◆", iconType: "ref", label: "Moodboard visual" },
      { icon: "◆", iconType: "ref", label: "Paleta de materiais / acabamentos" },
      { icon: "◆", iconType: "ref", label: "Atmosfera, iluminação, enquadramentos" },
    ],
  },
  {
    key: "02_modelagem",
    type: "phase",
    label: "Modelagem 3D",
    subtitle: "Construção do modelo",
    description:
      "Modelagem do empreendimento a partir do projeto arquitetônico e da direção visual aprovada. Setup de câmeras conforme briefing.",
    estimatedDays: "10–12 dias",
    estimatedDaysNum: 12,
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
    deliverables: [
      { icon: "▲", iconType: "model", label: "Modelagem estrutural + volumetria" },
      { icon: "▲", iconType: "model", label: "Paisagismo + entorno" },
      { icon: "▲", iconType: "model", label: "Interiores + setup de câmeras" },
    ],
  },
  {
    key: "03_clay_render",
    type: "phase",
    label: "Clay Render",
    subtitle: "Validação volumétrica",
    description:
      "Render sem materiais para validação de volumetria, proporções, iluminação e composição de câmera.",
    estimatedDays: "até 5 dias",
    estimatedDaysNum: 5,
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
    deliverables: [
      {
        icon: "●",
        iconType: "render",
        label: "Render clay de todas as câmeras",
        specs: [
          { label: "JPG", type: "format" },
          { label: "Web 72dpi", type: "res" },
          { label: "Google Drive", type: "channel" },
        ],
      },
      { icon: "✓", iconType: "check", label: "Validação de proporções e composição" },
    ],
  },
  {
    key: "gate_clay",
    type: "gate",
    label: "Aprovação do Clay",
    subtitle: "Entrega ao cliente",
    description: "Entrega do clay render ao cliente para aprovação volumétrica.",
    estimatedDays: "3–5 dias",
    estimatedDaysNum: 5,
    color: "#F59E0B",
    tag: "aprovacao",
    owner: "Cliente",
    deliverables: [],
  },
  {
    key: "04_emissao_inicial",
    type: "phase",
    label: "Emissão Inicial",
    subtitle: "1ª Rodada de Render",
    description:
      "Primeira rodada com materiais aplicados em todos os ângulos. Ambientação, humanização e iluminação geral.",
    estimatedDays: "15–20 dias",
    estimatedDaysNum: 20,
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
    deliverables: [
      {
        icon: "●",
        iconType: "render",
        label: "Renders com materiais aplicados",
        specs: [
          { label: "JPG", type: "format" },
          { label: "Web 72dpi", type: "res" },
          { label: "Google Drive", type: "channel" },
        ],
      },
      { icon: "●", iconType: "render", label: "Ambientação + humanização" },
    ],
  },
  {
    key: "gate_emissao",
    type: "gate",
    label: "Considerações sobre Emissão Inicial",
    subtitle: "Entrega ao cliente",
    description: "Entrega da emissão inicial para considerações do cliente.",
    estimatedDays: "3–5 dias",
    estimatedDaysNum: 5,
    color: "#F59E0B",
    tag: "aprovacao",
    owner: "Cliente",
    deliverables: [],
  },
  {
    key: "05_r01",
    type: "phase",
    label: "R01",
    subtitle: "2ª Rodada de Render",
    description:
      "Ajustes de materiais, iluminação, vegetação e entorno detalhado com base nas considerações do cliente sobre a Emissão Inicial.",
    estimatedDays: "3–5 dias",
    estimatedDaysNum: 5,
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
    deliverables: [
      {
        icon: "●",
        iconType: "render",
        label: "Ajustes de materiais + iluminação",
        specs: [
          { label: "JPG", type: "format" },
          { label: "Web 72dpi", type: "res" },
          { label: "Google Drive", type: "channel" },
        ],
      },
      { icon: "●", iconType: "render", label: "Vegetação e entorno detalhados" },
    ],
  },
  {
    key: "gate_r01",
    type: "gate",
    label: "Considerações sobre R01",
    subtitle: "Entrega ao cliente",
    description: "Entrega da R01 para considerações do cliente.",
    estimatedDays: "3–5 dias",
    estimatedDaysNum: 5,
    color: "#F59E0B",
    tag: "aprovacao",
    owner: "Cliente",
    deliverables: [],
  },
  {
    key: "06_r02",
    type: "phase",
    label: "R02",
    subtitle: "3ª Rodada de Render",
    description:
      "Pós-produção, color grading e últimos ajustes de detalhe. Máximo de 1 rodada de correções pontuais após entrega.",
    estimatedDays: "3–5 dias",
    estimatedDaysNum: 5,
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
    deliverables: [
      {
        icon: "●",
        iconType: "render",
        label: "Pós-produção + color grading",
        specs: [
          { label: "JPG", type: "format" },
          { label: "Web 72dpi", type: "res" },
          { label: "Google Drive", type: "channel" },
        ],
      },
      { icon: "✓", iconType: "check", label: "Máx. 1 rodada de ajustes pontuais" },
    ],
  },
  {
    key: "gate_final",
    type: "gate",
    label: "Aprovação Final",
    subtitle: "Entrega ao cliente",
    description: "Aprovação final do cliente antes da entrega definitiva.",
    estimatedDays: "3–5 dias",
    estimatedDaysNum: 5,
    color: "#10B981",
    tag: "aprovacao",
    owner: "Cliente",
    deliverables: [],
  },
  {
    key: "07_entrega_final",
    type: "phase",
    label: "Entrega Final",
    subtitle: "Empacotamento",
    description:
      "Empacotamento e entrega de todos os assets finais aprovados. Organização no Drive com estrutura padrão TBO.",
    estimatedDays: "1–2 dias",
    estimatedDaysNum: 2,
    color: "#18181B",
    tag: "output",
    owner: "Cliente",
    deliverables: [
      {
        icon: "●",
        iconType: "render",
        label: "Renders em alta resolução",
        specs: [
          { label: "TIFF / PNG", type: "format" },
          { label: "300dpi", type: "res" },
        ],
      },
      {
        icon: "●",
        iconType: "render",
        label: "Renders para web",
        specs: [
          { label: "JPG", type: "format" },
          { label: "72dpi", type: "res" },
        ],
      },
      {
        icon: "●",
        iconType: "render",
        label: "Tour 360° + Flythrough",
        specs: [
          { label: "MP4 / HTML", type: "format" },
          { label: "Opcional", type: "res" },
        ],
      },
      {
        icon: "●",
        iconType: "render",
        label: "Arquivos-fonte + handoff AV",
        specs: [{ label: "Google Drive", type: "channel" }],
      },
    ],
  },
];

/** All stage keys in order */
export const D3D_STAGE_KEYS = D3D_STAGE_CONFIGS.map((s) => s.key);

/** Only phase keys (not gates) */
export const D3D_PHASE_KEYS = D3D_STAGE_CONFIGS.filter((s) => s.type === "phase").map((s) => s.key);

/** Only gate keys */
export const D3D_GATE_KEYS = D3D_STAGE_CONFIGS.filter((s) => s.type === "gate").map((s) => s.key);

/** Get config by key */
export function getStageConfig(key: string) {
  return D3D_STAGE_CONFIGS.find((s) => s.key === key);
}

/** Timeline bar segments for the global timeline */
export const D3D_TIMELINE_SEGMENTS = [
  { key: "00_briefing", label: "Briefing", days: "1–2d", color: "#E85102", flex: 2 },
  { key: "01_direcao_visual", label: "Dir. Visual", days: "2–3d", color: "#3B82F6", flex: 3 },
  { key: "02_modelagem", label: "Modelagem", days: "10–12d", color: "#FD8241", flex: 11 },
  { key: "03_clay_render", label: "Clay", days: "até 5d", color: "#FD8241", flex: 5 },
  { key: "gate_clay", label: "Aprov.", days: "3–5d", color: "#F59E0B", flex: 4, isGate: true },
  { key: "04_emissao_inicial", label: "Emissão Inicial", days: "15–20d", color: "#FD8241", flex: 17 },
  { key: "gate_emissao", label: "Aprov.", days: "3–5d", color: "#F59E0B", flex: 4, isGate: true },
  { key: "05_r01", label: "R01", days: "3–5d", color: "#FD8241", flex: 4 },
  { key: "gate_r01", label: "Aprov.", days: "3–5d", color: "#F59E0B", flex: 4, isGate: true },
  { key: "06_r02", label: "R02", days: "3–5d", color: "#FD8241", flex: 4 },
  { key: "gate_final", label: "Aprov.", days: "3–5d", color: "#10B981", flex: 4, isGate: true },
  { key: "07_entrega_final", label: "Entrega", days: "1–2d", color: "#18181B", flex: 2 },
] as const;

/** Tag colors */
export const D3D_TAG_COLORS = {
  input: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6", label: "INPUT" },
  producao: { bg: "rgba(232,81,2,0.08)", color: "#E85102", label: "PRODUÇÃO" },
  output: { bg: "rgba(16,185,129,0.08)", color: "#10B981", label: "OUTPUT" },
  aprovacao: { bg: "rgba(245,158,11,0.08)", color: "#F59E0B", label: "APROVAÇÃO" },
} as const;

/** Status display */
export const D3D_STATUS_DISPLAY = {
  pending: { label: "Pendente", color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
  in_progress: { label: "Em Andamento", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  completed: { label: "Concluído", color: "#22C55E", bg: "rgba(34,197,94,0.08)" },
  approved: { label: "Aprovado", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  changes_requested: { label: "Revisão", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
} as const;
