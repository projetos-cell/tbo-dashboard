import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal do Projeto · TBO",
  description: "Acompanhamento de projeto — visualização do cliente",
};

export default function ProjectPortalLayout({
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
