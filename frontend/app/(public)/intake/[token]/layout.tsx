import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulário de Intake · TBO",
  description: "Envie uma solicitação para o projeto",
};

export default function IntakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {children}
    </div>
  );
}
