"use client";

import { motion } from "framer-motion";

const TIMELINE_STAGES = [
  {
    week: "Sem. 1–2",
    label: "Kickoff",
    description: "Briefing, análise do projeto, definição de câmeras",
    color: "#E85102",
    icon: "🎯",
  },
  {
    week: "Sem. 3–5",
    label: "Modelagem",
    description: "Construção 3D, texturas, iluminação base, clay render",
    color: "#3B82F6",
    icon: "🔨",
  },
  {
    week: "Sem. 6–7",
    label: "Revisão",
    description: "2 rodadas de ajustes, pós-produção, color grading",
    color: "#F59E0B",
    icon: "🔄",
  },
  {
    week: "Sem. 8",
    label: "Entrega",
    description: "Renderização final, organização de assets, backup",
    color: "#10B981",
    icon: "✅",
  },
];

export function ProposalTimeline() {
  return (
    <section id="section-timeline" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-bold text-zinc-900 mb-2">
          Timeline Indicativa
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Cronograma estimado com marcos principais. Detalhamento final após
          aprovação.
        </p>

        {/* Progress bar visual */}
        <div className="mb-8 bg-white rounded-xl border shadow-sm p-5">
          <div className="flex rounded-lg overflow-hidden h-3 mb-3">
            {TIMELINE_STAGES.map((stage, idx) => (
              <motion.div
                key={idx}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="origin-left"
                style={{
                  backgroundColor: stage.color,
                  flex: idx === 1 ? 3 : idx === 2 ? 2 : 1,
                }}
              />
            ))}
          </div>
          <div className="flex text-[10px] text-zinc-400 font-medium">
            {TIMELINE_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className="text-center"
                style={{ flex: idx === 1 ? 3 : idx === 2 ? 2 : 1 }}
              >
                {stage.week}
              </div>
            ))}
          </div>
        </div>

        {/* Stage cards */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-200 hidden sm:block" />

          <div className="space-y-4">
            {TIMELINE_STAGES.map((stage, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex items-start gap-4 relative"
              >
                {/* Dot */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 relative z-10"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.icon}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-zinc-900 text-sm">
                      {stage.label}
                    </p>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${stage.color}12`,
                        color: stage.color,
                      }}
                    >
                      {stage.week}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
