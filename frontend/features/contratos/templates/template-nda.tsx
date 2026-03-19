import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import {
  PdfHeader,
  PdfFooter,
  PdfParties,
  PdfSignatures,
  PdfCustomClauses,
  formatDate,
} from "./pdf-shared";
import type { ContractPdfData } from "./types";

export function TemplateNDA({ data }: { data: ContractPdfData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />

        {/* Title */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
            Acordo de Confidencialidade
          </Text>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 2 }}>
            (Non-Disclosure Agreement — NDA)
          </Text>
          <Text style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
            {data.title}
          </Text>
        </View>

        {/* Parties */}
        <PdfParties data={data} />

        {/* Preamble */}
        <Text style={s.sectionTitle}>Preambulo</Text>
        <Text style={s.paragraph}>
          As partes acima qualificadas, doravante denominadas PARTE REVELADORA e
          PARTE RECEPTORA (conforme o contexto da informacao compartilhada),
          celebram o presente Acordo de Confidencialidade nos seguintes termos:
        </Text>

        {/* Definitions */}
        <Text style={s.sectionTitle}>Clausula 1 — Das Definicoes</Text>
        <Text style={s.paragraph}>
          Para os efeitos deste acordo, entende-se por INFORMACAO CONFIDENCIAL toda
          e qualquer informacao, divulgada por qualquer meio, incluindo, mas nao se
          limitando a: dados comerciais, financeiros, tecnicos, estrategicos,
          propriedade intelectual, know-how, processos, metodologias, lista de
          clientes, fornecedores, parceiros, projetos em andamento, planos de
          negocios e quaisquer outras informacoes que nao sejam de dominio publico.
        </Text>

        {/* Obligations */}
        <Text style={s.sectionTitle}>Clausula 2 — Das Obrigacoes</Text>
        <Text style={s.paragraph}>
          A PARTE RECEPTORA compromete-se a:
        </Text>
        <Text style={s.paragraph}>
          a) Manter sigilo absoluto sobre todas as Informacoes Confidenciais
          recebidas;
        </Text>
        <Text style={s.paragraph}>
          b) Nao divulgar, reproduzir, transmitir ou de qualquer forma tornar
          disponivel a terceiros as Informacoes Confidenciais;
        </Text>
        <Text style={s.paragraph}>
          c) Utilizar as Informacoes Confidenciais exclusivamente para a finalidade
          acordada entre as partes;
        </Text>
        <Text style={s.paragraph}>
          d) Restringir o acesso as Informacoes Confidenciais apenas aos
          colaboradores que delas necessitem;
        </Text>
        <Text style={s.paragraph}>
          e) Devolver ou destruir, a pedido da PARTE REVELADORA, todos os documentos
          e materiais contendo Informacoes Confidenciais.
        </Text>

        {/* Exceptions */}
        <Text style={s.sectionTitle}>Clausula 3 — Das Excecoes</Text>
        <Text style={s.paragraph}>
          Nao serao consideradas Informacoes Confidenciais aquelas que:
        </Text>
        <Text style={s.paragraph}>
          a) Ja eram de dominio publico na data de sua divulgacao;
        </Text>
        <Text style={s.paragraph}>
          b) Tornarem-se publicas sem culpa da PARTE RECEPTORA;
        </Text>
        <Text style={s.paragraph}>
          c) Ja estavam legitimamente em poder da PARTE RECEPTORA antes da divulgacao;
        </Text>
        <Text style={s.paragraph}>
          d) Forem desenvolvidas independentemente pela PARTE RECEPTORA;
        </Text>
        <Text style={s.paragraph}>
          e) Forem divulgadas por determinacao judicial ou legal.
        </Text>

        {/* Duration */}
        <Text style={s.sectionTitle}>Clausula 4 — Da Vigencia</Text>
        <Text style={s.paragraph}>
          Este acordo entra em vigor na data de sua assinatura e permanecera em vigor
          pelo periodo de {formatDate(data.startDate)} a {formatDate(data.endDate)}.
          A obrigacao de confidencialidade subsistira por 3 (tres) anos apos o
          termino da vigencia ou do relacionamento entre as partes, o que ocorrer
          por ultimo.
        </Text>

        {/* Penalty */}
        <Text style={s.sectionTitle}>Clausula 5 — Das Penalidades</Text>
        <Text style={s.paragraph}>
          A violacao de qualquer obrigacao prevista neste acordo sujeitara a parte
          infratora ao pagamento de multa nao-compensatoria no valor de{" "}
          {data.totalValue > 0
            ? `R$ ${data.totalValue.toLocaleString("pt-BR")}`
            : "_______________"}, sem prejuizo das perdas e danos efetivamente
          apurados e demais cominacoes legais cabiveis.
        </Text>

        {/* Custom clauses */}
        <PdfCustomClauses clauses={data.customClauses} />

        {/* Forum */}
        <Text style={s.sectionTitle}>Clausula 6 — Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de Sao Paulo/SP para dirimir quaisquer
          controversias oriundas deste acordo, com renúncia expressa a qualquer
          outro, por mais privilegiado que seja.
        </Text>

        {/* Signatures */}
        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
