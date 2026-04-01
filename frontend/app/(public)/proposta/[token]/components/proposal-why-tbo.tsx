"use client";

import { motion } from "framer-motion";
import {
  IconBuildingSkyscraper,
  IconUsers,
  IconShieldCheck,
  IconPuzzle,
} from "@tabler/icons-react";

const DIFFERENTIALS = [
  {
    icon: IconBuildingSkyscraper,
    title: "115+ projetos entregues",
    description:
      "Portfólio consolidado em visualização para lançamentos imobiliários em Curitiba, Florianópolis, São Paulo e litoral.",
  },
  {
    icon: IconUsers,
    title: "Equipe dedicada de artistas 3D",
    description:
      "Time especializado exclusivamente em archviz imobiliário — não somos generalistas, somos especialistas em lançamento.",
  },
  {
    icon: IconShieldCheck,
    title: "Processo D3D com controle de qualidade",
    description:
      "Metodologia proprietária com gates de aprovação em cada fase. Nada avança sem validação técnica e do cliente.",
  },
  {
    icon: IconPuzzle,
    title: "Integração com branding e marketing",
    description:
      "Entendemos de lançamento imobiliário, não só de render. Cada imagem é pensada para um canal e um objetivo comercial específico.",
  },
];

export function ProposalWhyTBO() {
  return (
    <section id="section-why" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Por que a TBO</h2>
        <p className="text-sm text-zinc-500 mb-6">
          O que diferencia a TBO de outros estúdios de visualização.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIFFERENTIALS.map((diff, idx) => {
            const Icon = diff.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                    <Icon size={20} className="text-zinc-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm mb-1">
                      {diff.title}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {diff.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
