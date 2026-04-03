"use client";

import { motion } from "framer-motion";
import { IconSparkles, IconArrowRight } from "@tabler/icons-react";

export function ProposalUpsell() {
  return (
    <section id="section-upsell" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="relative rounded-xl overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#18181B]" />

        {/* Content */}
        <div className="relative px-4 py-5 sm:px-6 sm:py-8">
          <div className="flex items-center gap-2 mb-3">
            <IconSparkles size={20} className="text-[#E85102]" />
            <span className="text-xs font-bold text-[#E85102] uppercase tracking-wider">
              Pacote expandido
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">
            D3D + Branding do Empreendimento
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-3 sm:mb-5 max-w-xl">
            Contrate a visualização 3D integrada com o branding do empreendimento.
            Naming, identidade visual, key visual — tudo alinhado com a direção
            criativa do 3D. Briefing único, equipe integrada, menos retrabalho.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-5">
            {[
              {
                title: "Consistência",
                desc: "Renders e material de marketing com a mesma linguagem visual",
              },
              {
                title: "Economia",
                desc: "Briefing único e processo integrado = menos idas e vindas",
              },
              {
                title: "Velocidade",
                desc: "Equipe que já conhece o projeto produz mais rápido",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <p className="font-semibold text-white text-xs mb-0.5">
                  {item.title}
                </p>
                <p className="text-[10px] text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#E85102] font-medium">
            <span>Consulte condições especiais para pacote completo</span>
            <IconArrowRight size={16} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
