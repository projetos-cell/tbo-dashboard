"use client";

import {
  IconMapPin,
  IconBuilding,
  IconRuler,
  IconPool,
  IconBuildingSkyscraper,
  IconCalendar,
  IconExternalLink,
  IconPhone,
  IconMail,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PortalAboutSectionProps {
  projectName: string;
  clientCompany: string | null;
}

export function PortalAboutSection({ projectName, clientCompany }: PortalAboutSectionProps) {
  return (
    <div className="space-y-6">
      {/* Project Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-8 text-white">
        <Badge className="mb-4 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30">
          Lancamento Imobiliario
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight">AUMA</h2>
        <p className="mt-2 text-lg text-stone-300">
          Harmonia entre o ser, o espaco e o tempo
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-400">
          Inspirado pela sincronia com a natureza, o AUMA convida a viver com alma atraves de
          linhas arquitetonicas envolvidas pela beleza, contando historias de exclusividade e
          sofisticacao. Um empreendimento que une design contemporaneo, conforto acustico e
          termico, e uma localizacao privilegiada no coracao do Cabral.
        </p>
      </div>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconMapPin className="h-4 w-4 text-orange-500" />
            Localizacao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-zinc-900">
            Rua Jovino do Rosario, 146 — Cabral, Curitiba
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              Walk Score: 92
            </Badge>
            <span className="text-xs text-zinc-500">Paraiso para Caminhantes</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              "Clube Duque de Caxias — 3 min",
              "Quadrata Mall — 3 min",
              "Restaurante Bobardi — 3 min",
              "Graciosa Country Club — 4 min",
            ].map((item) => (
              <div key={item} className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipologias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconRuler className="h-4 w-4 text-orange-500" />
            Tipologias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { tipo: "1 Quarto", area: "44,32 m²" },
              { tipo: "2 Quartos", area: "73,79 m²" },
              { tipo: "3 Quartos", area: "82,11 m²" },
              { tipo: "3 Quartos", area: "118,67 m²" },
              { tipo: "Cobertura Duplex", area: "205,96 m²" },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-xl border bg-zinc-50/50 p-4 text-center"
              >
                <p className="text-xs font-medium text-zinc-500">{t.tipo}</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">{t.area}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Areas Comuns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconPool className="h-4 w-4 text-orange-500" />
            Areas Comuns — +14 espacos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Academia",
              "Piscina Coberta Aquecida",
              "Sauna & SPA",
              "Espaco Gourmet",
              "Pub Room",
              "Brinquedoteca",
              "Sala de Reunioes",
              "Espaco Descompressao",
              "Bicicletario",
              "Jardim Externo",
              "Take It & Market",
              "Espaco Delivery",
              "Rooftop",
              "Lavanderia",
            ].map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diferenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconBuildingSkyscraper className="h-4 w-4 text-orange-500" />
            Diferenciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-700">
            {[
              "Piso aquecido nos banheiros",
              "Alvenaria com espessura para conforto acustico",
              "Manta acustica entre pavimentos",
              "Aquecedores individuais a gas",
              "Infraestrutura para aspiracao central",
              "Infraestrutura para ar-condicionado",
              "Servico de personalizacao de unidades",
            ].map((diff) => (
              <li key={diff} className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                {diff}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sobre a Incorporadora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconBuilding className="h-4 w-4 text-orange-500" />
            Sobre o {clientCompany ?? "Grupo Thal"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-600">
            Atuante desde 2005, o Grupo Thal ja entregou mais de 550 mil m² em empreendimentos,
            consolidando-se como referencia no mercado imobiliario curitibano. Sua politica de
            qualidade expressa o compromisso de construir obras com excelencia, buscando a
            satisfacao do cliente e a melhoria continua dos processos.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-2xl font-bold text-zinc-900">550k+</p>
              <p className="text-xs text-zinc-500">m² entregues</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-2xl font-bold text-zinc-900">20+</p>
              <p className="text-xs text-zinc-500">anos de mercado</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2 text-xs text-zinc-500">
            <a
              href="https://grupothal.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-orange-600"
            >
              <IconExternalLink className="h-3 w-3" />
              grupothal.com.br
            </a>
            <span className="flex items-center gap-1">
              <IconPhone className="h-3 w-3" />
              (41) 3345-1212
            </span>
            <span className="flex items-center gap-1">
              <IconMail className="h-3 w-3" />
              contato@grupothal.com.br
            </span>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-2">Outros empreendimentos</p>
            <div className="flex flex-wrap gap-2">
              {["Legacy (Pinhais)", "La Dolce Vista (Tingui)", "Grand Palermo (Capao Raso)", "Merizzo (Capao Raso)"].map((emp) => (
                <Badge key={emp} variant="outline" className="text-xs">{emp}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconCalendar className="h-4 w-4 text-orange-500" />
            Previsao de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-zinc-900">2027</p>
          <p className="mt-1 text-sm text-zinc-500">
            Previsao de entrega do empreendimento AUMA
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
