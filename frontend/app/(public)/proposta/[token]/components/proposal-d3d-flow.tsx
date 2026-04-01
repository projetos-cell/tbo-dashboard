"use client";

import { motion } from "framer-motion";

// ── D3D stages simplificados para proposta pública ──────────────────
const D3D_PUBLIC_STAGES = [
  {
    key: "discovery",
    phase: "D",
    label: "Discovery",
    subtitle: "Imersão + Estratégia",
    color: "#E85102",
    steps: [
      "Análise do projeto arquitetônico completo",
      "Briefing com incorporadora: público, posicionamento, canais",
      "Definição estratégica de câmeras com visão de produto",
      "Moodboard de referências e paleta de ambientação",
    ],
    output: "Plano de câmeras aprovado + direção criativa alinhada",
  },
  {
    key: "development",
    phase: "3D",
    label: "Development",
    subtitle: "Produção com Controle",
    color: "#3B82F6",
    steps: [
      "Modelagem 3D com precisão técnica",
      "Texturas realistas e iluminação cinematográfica",
      "Clay render para validação volumétrica",
      "Ciclos de revisão colaborativa com o cliente",
    ],
    output: "Renders aprovados em múltiplas rodadas de refinamento",
  },
  {
    key: "delivery",
    phase: "D",
    label: "Delivery",
    subtitle: "Entrega Estratégica",
    color: "#10B981",
    steps: [
      "Renderização final em resolução 4K+",
      "Assets organizados por canal de mídia",
      "Nomenclatura padronizada para equipe e agência",
      "Backup em nuvem com acesso permanente",
    ],
    output: "Assets prontos para book, landing page, outdoor e redes sociais",
  },
];

// ── Connector arrow ─────────────────────────────────────────────────
function Connector() {
  return (
    <div className="hidden md:flex items-center justify-center px-1">
      <div className="w-8 h-px bg-zinc-300 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-zinc-300 border-y-[4px] border-y-transparent" />
      </div>
    </div>
  );
}

export function ProposalD3DFlow() {
  return (
    <section id="section-d3d" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#18181B] flex items-center justify-center">
              <span className="text-white font-bold text-sm">D3D</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Nosso Processo — D3D
              </h2>
              <p className="text-sm text-zinc-500">
                Discovery · Development · Delivery
              </p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
            Cada projeto passa pelo nosso fluxo proprietário D3D — um processo em
            3 fases que garante que cada imagem é pensada estrategicamente, produzida
            com controle de qualidade e entregue pronta para uso comercial.
          </p>
        </div>

        {/* Pipeline visual */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
          {D3D_PUBLIC_STAGES.map((stage, idx) => (
            <div key={stage.key} className="contents">
              {idx > 0 && <Connector />}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Phase header */}
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ backgroundColor: `${stage.color}0A` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.phase}
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: stage.color }}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-zinc-500">{stage.subtitle}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="px-5 py-4 space-y-2">
                  {stage.steps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-2 text-sm text-zinc-600"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Output */}
                <div className="px-5 pb-4">
                  <div
                    className="rounded-lg px-3 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: `${stage.color}0A`,
                      color: stage.color,
                    }}
                  >
                    → {stage.output}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
