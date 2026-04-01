import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrega de Projeto · TBO",
  description: "Acesse os entregáveis do seu projeto com a TBO.",
};

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0ede9] text-stone-900 antialiased selection:bg-[#E85102]/20">
      {children}
    </div>
  );
}
