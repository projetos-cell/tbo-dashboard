"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
  image?: string;
  imageAlt?: string;
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
    color: "#52525B",
    tag: "producao",
    owner: "TBO",
  },
  {
    step: "02",
    title: "Modelagem 3D",
    image: "/metodo/img/d3d_02.jpeg",
    imageAlt: "Viewport 3D — modelagem do empreendimento",
    subtitle: "Construção do modelo",
    days: "10–12 dias",
    description:
      "Modelagem do empreendimento a partir do projeto arquitetônico e da direção visual aprovada. Setup de câmeras conforme briefing.",
    deliverables: [
      { icon: "▲", iconType: "model", label: "Modelagem estrutural + volumetria" },
      { icon: "▲", iconType: "model", label: "Paisagismo + entorno" },
      { icon: "▲", iconType: "model", label: "Interiores + setup de câmeras" },
    ],
    color: "#3F3F46",
    tag: "producao",
    owner: "TBO",
  },
  {
    step: "03",
    title: "Clay Render",
    image: "/metodo/img/d3d_03.jpg",
    imageAlt: "Clay render — validação volumétrica sem materiais",
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
    color: "#3F3F46",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Aprovação do Clay", color: "amber" },
  {
    step: "04",
    title: "Emissão Inicial",
    image: "/metodo/img/d3d_07_web.jpg",
    imageAlt: "Emissão inicial — primeiro render com materiais aplicados",
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
    color: "#3F3F46",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Considerações sobre Emissão Inicial", color: "amber" },
  {
    step: "05",
    title: "R01",
    image: "/metodo/img/d3d_08_1.jpg",
    imageAlt: "R01 — ajustes de materiais e iluminação",
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
    color: "#3F3F46",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Considerações sobre R01", color: "amber" },
  {
    step: "06",
    title: "R02",
    image: "/metodo/img/d3d_08_3.jpg",
    imageAlt: "R02 — pós-produção e color grading",
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
    color: "#3F3F46",
    tag: "producao",
    owner: "TBO",
  },
  { type: "gate", label: "Entrega ao cliente", action: "Aprovação final", color: "green" },
  {
    step: "07",
    title: "Entrega Final",
    image: "/metodo/img/d3d_08_4.jpg",
    imageAlt: "Entrega final — render em alta resolução",
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
// Monocromático: zinc + accent #E85102
const TIMELINE_SEGMENTS = [
  { label: "Briefing", days: "1–2d", color: "#E85102", flex: 2 },
  { label: "Dir. Visual", days: "2–3d", color: "#52525B", flex: 3 },
  { label: "Modelagem", days: "10–12d", color: "#3F3F46", flex: 11 },
  { label: "Clay", days: "até 5d", color: "#3F3F46", flex: 5 },
  { label: "Aprov.", days: "3–5d", color: "#A1A1AA", flex: 4, isGate: true },
  { label: "Emissão Inicial", days: "15–20d", color: "#3F3F46", flex: 17 },
  { label: "Aprov.", days: "3–5d", color: "#A1A1AA", flex: 4, isGate: true },
  { label: "R01", days: "3–5d", color: "#3F3F46", flex: 4 },
  { label: "Aprov.", days: "3–5d", color: "#A1A1AA", flex: 4, isGate: true },
  { label: "R02", days: "3–5d", color: "#3F3F46", flex: 4 },
  { label: "Aprov.", days: "3–5d", color: "#71717A", flex: 4, isGate: true },
  { label: "Entrega", days: "1–2d", color: "#18181B", flex: 2 },
];

// ── Helpers ──────────────────────────────────────────────────────────
// Paleta reduzida: zinc monocromático + #E85102 accent
const MONO = {
  accent: "#E85102",
  accentSoft: "rgba(232,81,2,0.08)",
  dark: "#18181B",
  mid: "#52525B",
  muted: "#A1A1AA",
  subtle: "rgba(113,113,122,0.08)",
};

const TAG_STYLES = {
  input: { bg: MONO.accentSoft, color: MONO.accent, label: "INPUT" },
  producao: { bg: MONO.subtle, color: MONO.mid, label: "PRODUÇÃO" },
  output: { bg: MONO.accentSoft, color: MONO.accent, label: "OUTPUT" },
};

const ICON_STYLES = {
  ref: { bg: MONO.subtle, color: MONO.mid },
  model: { bg: MONO.subtle, color: MONO.mid },
  render: { bg: MONO.subtle, color: MONO.mid },
  check: { bg: MONO.accentSoft, color: MONO.accent },
};

const SPEC_STYLES = {
  format: { bg: MONO.subtle, color: MONO.mid },
  res: { bg: MONO.subtle, color: MONO.mid },
  channel: { bg: MONO.subtle, color: MONO.mid },
};

function isGate(item: PipelineItem): item is GateData {
  return "type" in item && item.type === "gate";
}

// ── Gate component ──────────────────────────────────────────────────
function GateNode({ gate }: { gate: GateData }) {
  const isFinal = gate.color === "green";
  const gateColor = isFinal ? MONO.accent : MONO.muted;
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-[100px] relative py-3">
      {/* Line through */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-200" />
      {/* Diamond */}
      <div
        className="relative z-10 w-8 h-8 rounded-md flex items-center justify-center bg-white border border-zinc-200 shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L22 12L12 22L2 12Z"
            fill={`${gateColor}15`}
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
        style={{ color: isFinal ? MONO.accent : MONO.mid }}
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
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: idx * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`${cardBg} rounded-xl border shadow-sm min-w-[220px] max-w-[240px] shrink-0 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
        isStart
          ? "border-[#E85102]"
          : isEnd
            ? "border-[#18181B]"
            : "border-zinc-200"
      }`}
    >
      {/* Image area */}
      {stage.image && (
        <div className="relative h-[120px] overflow-hidden">
          <Image
            src={stage.image}
            alt={stage.imageAlt ?? stage.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="240px"
          />
          {isEnd && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] to-transparent" />
          )}
        </div>
      )}

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
                  : "#A1A1AA",
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
                        color: isStart ? "#fff" : "rgba(255,255,255,0.6)",
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
                                  backgroundColor: "rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.5)",
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
                ? { backgroundColor: "rgba(232,81,2,0.15)", color: "#E85102" }
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
            { color: "#3F3F46", label: "Produção TBO" },
            { color: "#A1A1AA", label: "Aprovação Cliente" },
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
