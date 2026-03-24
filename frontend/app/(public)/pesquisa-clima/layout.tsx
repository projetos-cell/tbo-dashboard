import type { Metadata } from "next";
import type { ReactNode } from "react";

const BASE_URL = "https://os.wearetbo.com.br";

export const metadata: Metadata = {
  title: "Pesquisa de Clima | TBO",
  description:
    "4ª edição da Pesquisa de Clima da TBO. 100% anônima, ~9 min. Sua voz gera mudanças reais.",
  openGraph: {
    title: "Pesquisa de Clima — 4ª Edição | TBO",
    description:
      "100% anônima · ~9 min · As últimas edições já geraram mudanças reais. Essa também vai.",
    url: `${BASE_URL}/pesquisa-clima`,
    siteName: "TBO OS",
    images: [
      {
        url: `${BASE_URL}/api/og/pesquisa-clima`,
        width: 1200,
        height: 630,
        alt: "Pesquisa de Clima — 4ª Edição TBO",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pesquisa de Clima — 4ª Edição | TBO",
    description:
      "100% anônima · ~9 min · Sua voz gera mudanças reais.",
    images: [`${BASE_URL}/api/og/pesquisa-clima`],
  },
};

export default function PesquisaClimaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
