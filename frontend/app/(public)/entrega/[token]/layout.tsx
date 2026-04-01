import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrega de Projeto · TBO",
  description: "Acesse os entregáveis do seu projeto com a TBO.",
};

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-[#ff6200]/30">
      {children}
    </div>
  );
}
