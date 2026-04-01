"use client";

import { motion } from "framer-motion";

// ── Fluxo D3D completo baseado no pipeline real da TBO ──────────────
// 8 fases + 4 gates de aprovação

interface Deliverable {
  icon: string;
  iconType: "ref" | "model" | "render" | "check";
  label: string;
  specs?: { label: string; type: "format" | "res" | "channel" }[];
}

interface StageData {
  step: string;
  title: string;
  subtitle: string;
  days: string;
  description: string;
  deliverables: Deliverable[];
  color: string;
  tag: "input" | "producao" | "output";
  owner: string;
  variant?: "start" | "end";
}

interface GateData {
  type: "gate";
  label: string;
  action: string;
  color: "amber" | "green";
}

type PipelineItem = StageData | GateData;

const PIPELINE: PipelineItem[] = [
  {
    step: "00",
    title: "Briefing + Projeto Arq.",
    subtitle: "Kickoff",
    days: "1–2 dias",
    description:
      "Recebimento do projeto arquitetônico, briefing do cliente e alinhamento de expectativas visuais com a equipe.",
    deliverables: [
      { icon: "◆", iconType: "ref", label: "Plantas / Cortes / Fachadas" },
      { icon: "◆", iconType: "ref", label: "Briefing de referências do cliente" },
      { icon: "◆", iconType: "ref", label: "Definição de câmeras / ângulos" },
    ],
    color: "#E85102",
    tag: "input",
    owner: "Cliente + TBO",
    variant: "start",
  },
  {
    step: "01",
    title: "Direção Visual",
    subtitle: "Referências + Conceito",
    days: "2–3 dias",
    description:
      "Captação de referências visuais, montagem de moodboard, definição de paleta de materiais, atmosfera, iluminação e enquadramentos.",
    deliverables: [
      { icon: "◆", iconType: "ref", label: "Moodboard visual" },
      { icon: "◆", iconType: "ref", label: "Paleta de materiais / acabamentos" },
      { icon: "◆", iconType: "ref", label: "Atmosfera, iluminação, enquadramentos" },
    ],
    color: "#3B82F6",
    tag: "producao",
    owner: "TBO",
  },
  {
    step: "02",
    title: "Modelagem 3D",
    subtitle: "Construção do modelo",
    days: "10–12 dias",
    description:
      "Modelagem do empreendimento a partir do projeto arquitetônico e da direção visual aprovada. Setup de câmeras conforme briefing.",
    deliverables: [
      { icon: "▲", iconType: "model", label: "Modelagem estrutural + volumetria" },
      { icon: "▲", iconType: "model", label: "Paisagismo + entorno" },
      { icon: "▲", iconType: "model", label: "Interiores + setup de câmeras" },
    ],
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
  },
  {
    step: "03",
    title: "Clay Render",
    subtitle: "Validação volumétrica",
    days: "até 5 dias",
    description:
      "Render sem materiais para validação de volumetria, proporções, iluminação e composição de câmera.",
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
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Aprovação do Clay", color: "amber" },
  {
    step: "04",
    title: "Emissão Inicial",
    subtitle: "1ª Rodada de Render",
    days: "15–20 dias",
    description:
      "Primeira rodada com materiais aplicados em todos os ângulos. Ambientação, humanização e iluminação geral.",
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
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Considerações sobre Emissão Inicial", color: "amber" },
  {
    step: "05",
    title: "R01",
    subtitle: "2ª Rodada de Render",
    days: "3–5 dias",
    description:
      "Ajustes de materiais, iluminação, vegetação e entorno detalhado com base nas considerações do cliente sobre a Emissão Inicial.",
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
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Considerações sobre R01", color: "amber" },
  {
    step: "06",
    title: "R02",
    subtitle: "3ª Rodada de Render",
    days: "3–5 dias",
    description:
      "Pós-produção, color grading e últimos ajustes de detalhe. Máximo de 1 rodada de correções pontuais após entrega.",
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
    color: "#FD8241",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Aprovação final", color: "green" },
  {
    step: "07",
    title: "Entrega Final",
    subtitle: "Empacotamento",
    days: "1–2 dias",
    description:
      "Empacotamento e entrega de todos os assets finais aprovados. Organização no Drive com estrutura padrão TBO.",
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
        label: "Arquivos-fonte + handoff AV",
        specs: [{ label: "Google Drive", type: "channel" }],
      },
    ],
    color: "#18181B",
    tag: "output",
    owner: "Cliente",
    variant: "end",
  },
];

// ── Timeline bar ────────────────────────────────────────────────────
const TIMELINE_SEGMENTS = [
  { label: "Briefing", days: "1–2d", color: "#E85102", flex: 2 },
  { label: "Dir. Visual", days: "2–3d", color: "#3B82F6", flex: 3 },
  { label: "Modelagem", days: "10–12d", color: "#FD8241", flex: 11 },
  { label: "Clay", days: "até 5d", color: "#FD8241", flex: 5 },
  { label: "Aprov.", days: "3–5d", color: "#F59E0B", flex: 4, isGate: true },
  { label: "Emissão Inicial", days: "15–20d", color: "#FD8241", flex: 17 },
  { label: "Aprov.", days: "3–5d", color: "#F59E0B", flex: 4, isGate: true },
  { label: "R01", days: "3–5d", color: "#FD8241", flex: 4 },
  { label: "Aprov.", days: "3–5d", color: "#F59E0B", flex: 4, isGate: true },
  { label: "R02", days: "3–5d", color: "#FD8241", flex: 4 },
  { label: "Aprov.", days: "3–5d", color: "#10B981", flex: 4, isGate: true },
  { label: "Entrega", days: "1–2d", color: "#18181B", flex: 2 },
];

// ── Helpers ──────────────────────────────────────────────────────────
const TAG_STYLES = {
  input: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6", label: "INPUT" },
  producao: { bg: "rgba(232,81,2,0.08)", color: "#E85102", label: "PRODUÇÃO" },
  output: { bg: "rgba(16,185,129,0.08)", color: "#10B981", label: "OUTPUT" },
};

const ICON_STYLES = {
  ref: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" },
  model: { bg: "rgba(232,81,2,0.08)", color: "#E85102" },
  render: { bg: "rgba(16,185,129,0.08)", color: "#10B981" },
  check: { bg: "rgba(245,158,11,0.08)", color: "#F59E0B" },
};

const SPEC_STYLES = {
  format: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" },
  res: { bg: "rgba(139,92,246,0.08)", color: "#8B5CF6" },
  channel: { bg: "rgba(16,185,129,0.08)", color: "#10B981" },
};

function isGate(item: PipelineItem): item is GateData {
  return "type" in item && item.type === "gate";
}

// ── Gate component ──────────────────────────────────────────────────
function GateNode({ gate }: { gate: GateData }) {
  const gateColor = gate.color === "green" ? "#10B981" : "#F59E0B";
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-[100px] relative py-3">
      {/* Line through */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-200" />
      {/* Diamond */}
      <div
        className="relative z-10 w-8 h-8 rounded-md flex items-center justify-center bg-white border shadow-sm"
        style={{ borderColor: `${gateColor}40` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L22 12L12 22L2 12Z"
            fill={`${gateColor}20`}
            stroke={gateColor}
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <span className="relative z-10 text-[9px] text-zinc-400 uppercase tracking-wide text-center bg-zinc-50 px-1">
        {gate.label}
      </span>
      <span
        className="relative z-10 text-[10px] font-medium text-center bg-zinc-50 px-1 leading-tight"
        style={{ color: gateColor }}
      >
        {gate.action}
      </span>
    </div>
  );
}

// ── Phase card ──────────────────────────────────────────────────────
function PhaseCard({ stage, idx }: { stage: StageData; idx: number }) {
  const isStart = stage.variant === "start";
  const isEnd = stage.variant === "end";
  const tag = TAG_STYLES[stage.tag];

  const cardBg = isStart
    ? "bg-[#E85102]"
    : isEnd
      ? "bg-[#18181B]"
      : "bg-white";
  const textColor = isStart || isEnd ? "text-white" : "text-zinc-900";
  const subtextColor = isStart
    ? "text-white/65"
    : isEnd
      ? "text-white/45"
      : "text-zinc-500";
  const descColor = isStart
    ? "text-white/75"
    : isEnd
      ? "text-white/55"
      : "text-zinc-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: idx * 0.04 }}
      className={`${cardBg} rounded-xl border shadow-sm min-w-[220px] max-w-[240px] shrink-0 flex flex-col overflow-hidden hover:shadow-md transition-shadow ${
        isStart
          ? "border-[#E85102]"
          : isEnd
            ? "border-[#18181B]"
            : "border-zinc-200"
      }`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-0 flex items-start gap-2.5">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium shrink-0 ${
            isStart
              ? "bg-white/20 text-white border border-white/15"
              : isEnd
                ? "bg-white/10 text-white/60 border border-white/8"
                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
          }`}
        >
          {stage.step}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-[13px] leading-tight ${textColor}`}>
            {stage.title}
          </p>
          <p className={`text-[10px] mt-0.5 ${subtextColor}`}>
            {stage.subtitle}
          </p>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="px-4 mt-2.5 flex items-center gap-2">
        <div
          className={`flex-1 h-[3px] rounded-full ${
            isStart
              ? "bg-white/12"
              : isEnd
                ? "bg-white/8"
                : "bg-zinc-100"
          }`}
        >
          <div
            className="h-full rounded-full w-full"
            style={{
              backgroundColor: isStart
                ? "rgba(255,255,255,0.3)"
                : isEnd
                  ? "rgba(255,255,255,0.25)"
                  : stage.color,
            }}
          />
        </div>
        <span
          className={`text-[11px] font-medium shrink-0 ${
            isStart
              ? "text-white/70"
              : isEnd
                ? "text-white/50"
                : "text-zinc-600"
          }`}
        >
          {stage.days}
        </span>
      </div>

      {/* Description */}
      <div className="px-4 py-2">
        <p className={`text-[11px] leading-relaxed ${descColor}`}>
          {stage.description}
        </p>
      </div>

      {/* Deliverables */}
      <div className="px-4 pb-2 space-y-1 flex-1">
        {stage.deliverables.map((d, dIdx) => {
          const iconStyle = ICON_STYLES[d.iconType];
          return (
            <div
              key={dIdx}
              className={`flex items-start gap-2 text-[11px] rounded-md px-2 py-1.5 ${
                isStart
                  ? "bg-white/8 border border-white/12 text-white/70"
                  : isEnd
                    ? "bg-white/5 border border-white/8 text-white/60"
                    : "bg-zinc-50 border border-zinc-100 text-zinc-600"
              }`}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center text-[9px] shrink-0 mt-0.5"
                style={
                  isStart || isEnd
                    ? {
                        backgroundColor: "rgba(255,255,255,0.12)",
                        color: isStart ? "#fff" : "#6EE7B7",
                      }
                    : { backgroundColor: iconStyle.bg, color: iconStyle.color }
                }
              >
                {d.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span>{d.label}</span>
                {d.specs && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {d.specs.map((s, sIdx) => {
                      const specStyle = SPEC_STYLES[s.type];
                      return (
                        <span
                          key={sIdx}
                          className="text-[8px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide"
                          style={
                            isEnd
                              ? {
                                  backgroundColor:
                                    s.type === "format"
                                      ? "rgba(59,130,246,0.12)"
                                      : s.type === "res"
                                        ? "rgba(139,92,246,0.12)"
                                        : "rgba(16,185,129,0.12)",
                                  color:
                                    s.type === "format"
                                      ? "#93C5FD"
                                      : s.type === "res"
                                        ? "#C4B5FD"
                                        : "#6EE7B7",
                                }
                              : {
                                  backgroundColor: specStyle.bg,
                                  color: specStyle.color,
                                }
                          }
                        >
                          {s.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className={`px-4 py-2.5 mt-auto flex items-center justify-between border-t ${
          isStart
            ? "border-white/12"
            : isEnd
              ? "border-white/8"
              : "border-zinc-100"
        }`}
      >
        <span
          className="text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wider"
          style={
            isStart
              ? { backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }
              : isEnd
                ? { backgroundColor: "rgba(16,185,129,0.15)", color: "#6EE7B7" }
                : { backgroundColor: tag.bg, color: tag.color }
          }
        >
          {isStart ? "INPUT" : isEnd ? "OUTPUT" : tag.label}
        </span>
        <span
          className={`text-[10px] ${
            isStart
              ? "text-white/50"
              : isEnd
                ? "text-white/40"
                : "text-zinc-400"
          }`}
        >
          {stage.owner}
        </span>
      </div>
    </motion.div>
  );
}

// ── Connector arrow ─────────────────────────────────────────────────
function Connector() {
  return (
    <div className="flex items-center shrink-0 w-5 relative">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-zinc-300 border-y-[3px] border-y-transparent" />
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export function ProposalD3DFlow() {
  let phaseIdx = 0;

  return (
    <section id="section-d3d" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#18181B] flex items-center justify-center">
              <span className="text-white font-bold text-sm">D3D</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Digital 3D — Fluxo de Projeto
              </h2>
              <p className="text-sm text-zinc-500">
                Pipeline completo: do briefing à entrega final aprovada
              </p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
            8 fases de produção, 4 entregas com aprovação do cliente, 3 rodadas
            de refinamento. Cada etapa avança somente após validação — nada é
            entregue sem controle de qualidade.
          </p>
        </div>

        {/* Global timeline bar */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
          <div className="flex items-center gap-0">
            {TIMELINE_SEGMENTS.map((seg, idx) => (
              <div key={idx} className="contents">
                {idx > 0 && <div className="w-1.5 shrink-0" />}
                <div className="flex flex-col items-center" style={{ flex: seg.flex }}>
                  <span className="text-[10px] font-medium text-zinc-900 mb-1">
                    {seg.days}
                  </span>
                  <div
                    className="h-1.5 rounded-full w-full"
                    style={{
                      backgroundColor: seg.color,
                      opacity: seg.isGate ? 0.5 : 1,
                    }}
                  />
                  <span className="text-[8px] text-zinc-400 mt-1 truncate max-w-full">
                    {seg.label}
                  </span>
                </div>
              </div>
            ))}
            <div className="pl-4 ml-4 border-l border-zinc-200 text-center shrink-0">
              <p className="text-2xl font-bold text-[#E85102] leading-none">
                55–80
              </p>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider mt-1">
                dias úteis
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-5">
          {[
            { num: "8", label: "Fases" },
            { num: "4", label: "Entregas" },
            { num: "3", label: "Rodadas" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-lg border shadow-sm px-4 py-2.5 text-center"
            >
              <p className="text-xl font-bold text-zinc-900 leading-none">
                {s.num}
              </p>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Pipeline horizontal scroll */}
        <div className="overflow-x-auto -mx-4 px-4 pb-4 scrollbar-thin scrollbar-thumb-zinc-300">
          <div className="flex items-stretch gap-0 min-w-max">
            {PIPELINE.map((item, idx) => {
              if (isGate(item)) {
                return <GateNode key={`gate-${idx}`} gate={item} />;
              }
              const currentIdx = phaseIdx++;
              return (
                <div key={`phase-${idx}`} className="contents">
                  {currentIdx > 0 && !isGate(PIPELINE[idx - 1]) && (
                    <Connector />
                  )}
                  <PhaseCard stage={item} idx={currentIdx} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {[
            { color: "#E85102", label: "Kickoff / Input" },
            { color: "#3B82F6", label: "Referência" },
            { color: "#FD8241", label: "Produção TBO" },
            { color: "#F59E0B", label: "Aprovação Cliente" },
            { color: "#10B981", label: "Aprovação Final" },
            { color: "#18181B", label: "Entrega Final" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-zinc-400">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-zinc-400 text-center mt-4 max-w-xl mx-auto leading-relaxed">
          Cada entrega ao cliente requer aprovação formal antes de iniciar a
          próxima rodada. Rodadas adicionais além da R02 são escopo extra. Prazos
          estimados para projeto de complexidade média.
        </p>
      </motion.div>
    </section>
  );
}
