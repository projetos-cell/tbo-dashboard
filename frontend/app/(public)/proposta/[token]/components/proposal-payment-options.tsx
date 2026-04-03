"use client";

import { motion } from "framer-motion";
import { IconCheck } from "@tabler/icons-react";
import type { PaymentConditionOption } from "@/features/comercial/services/proposals";

interface ProposalPaymentOptionsProps {
  options: PaymentConditionOption[];
  totalValue: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ProposalPaymentOptions({
  options,
  totalValue,
}: ProposalPaymentOptionsProps) {
  if (options.length === 0) return null;

  return (
    <section id="section-payment" className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mb-1 sm:mb-2">
          Condições de Pagamento
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mb-3 sm:mb-6">
          Total de{" "}
          <span className="font-semibold text-zinc-700">
            {formatCurrency(totalValue)}
          </span>
          . Escolha a condição que melhor se adequa.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          {options.map((opt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={`relative rounded-xl border p-3.5 sm:p-5 shadow-sm transition-shadow hover:shadow-md ${
                opt.highlight
                  ? "border-[#E85102]/30 bg-[#E85102]/[0.02]"
                  : "bg-white"
              }`}
            >
              {opt.highlight && (
                <div className="absolute -top-2.5 right-4">
                  <span className="bg-[#E85102] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    Recomendado
                  </span>
                </div>
              )}
              <p className="font-semibold text-zinc-900 text-xs sm:text-sm mb-0.5 sm:mb-1">
                {opt.label}
              </p>
              <p className="text-zinc-900 font-bold text-base sm:text-lg mb-1 sm:mb-2">
                {opt.description}
              </p>
              {opt.details && (
                <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed">
                  {opt.details}
                </p>
              )}
              {opt.highlight && (
                <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[11px] sm:text-xs text-[#E85102] font-medium">
                  <IconCheck size={14} />
                  Melhor condição
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-[10px] sm:text-xs text-zinc-400 mt-3 sm:mt-4">
          Pagamento via boleto bancário emitido pela TBO, com vencimento
          vinculado aos marcos de entrega.
        </p>
      </motion.div>
    </section>
  );
}
