import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal do Cliente · TBO",
  description: "Dashboard de redes sociais — visualização do cliente",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080c10] text-[#e8e8e8]">{children}</div>
  );
}
