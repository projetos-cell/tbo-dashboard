import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import { TBO_DEFAULTS } from "./types";
import {
  PdfHeader,
  PdfFooter,
  PdfParties,
  PdfSignatures,
  PdfCustomClauses,
  formatCurrency,
} from "./pdf-shared";
import type { ContractPdfData } from "./types";

/**
 * Template NDA — Acordo de Confidencialidade
 * Com LGPD e padrao TBO
 */
export function TemplateNDA({ data }: { data: ContractPdfData }) {
  const forum = data.forumCity ?? TBO_DEFAULTS.forumCity;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />

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

        <PdfParties data={data} />

        {/* Preambulo */}
        <Text style={s.sectionTitle}>Preambulo</Text>
        <Text style={s.paragraph}>
          As partes acima qualificadas, doravante denominadas PARTE REVELADORA e
          PARTE RECEPTORA (conforme o contexto da informacao compartilhada),
          celebram o presente Acordo de Confidencialidade nos seguintes termos:
        </Text>

        {/* Definicoes */}
        <Text style={s.sectionTitle}>Clausula 1 — Das Definicoes</Text>
        <Text style={s.paragraph}>
          Para os efeitos deste acordo, entende-se por INFORMACAO CONFIDENCIAL toda
          e qualquer informacao, divulgada por qualquer meio, incluindo, mas nao se
          limitando a: dados comerciais, financeiros, tecnicos, estrategicos,
          propriedade intelectual, know-how, processos, metodologias, lista de
          clientes, fornecedores, parceiros, projetos em andamento, planos de
          negocios e quaisquer outras informacoes que nao sejam de dominio publico.
        </Text>

        {/* Obrigacoes */}
        <Text style={s.sectionTitle}>Clausula 2 — Das Obrigacoes</Text>
        <Text style={s.paragraph}>A PARTE RECEPTORA compromete-se a:</Text>
        <Text style={s.paragraph}>
          a) Manter sigilo absoluto sobre todas as Informacoes Confidenciais recebidas;
        </Text>
        <Text style={s.paragraph}>
          b) Nao divulgar, reproduzir, transmitir ou tornar disponivel a terceiros;
        </Text>
        <Text style={s.paragraph}>
          c) Utilizar exclusivamente para a finalidade acordada entre as partes;
        </Text>
        <Text style={s.paragraph}>
          d) Restringir o acesso apenas aos colaboradores que delas necessitem;
        </Text>
        <Text style={s.paragraph}>
          e) Devolver ou destruir, a pedido da PARTE REVELADORA, todos os documentos
          e materiais contendo Informacoes Confidenciais;
        </Text>
        <Text style={s.paragraph}>
          f) Efetuar o correto tratamento de dados pessoais de acordo com a LGPD
          (Lei n. 13.709/2018).
        </Text>

        {/* Excecoes */}
        <Text style={s.sectionTitle}>Clausula 3 — Das Excecoes</Text>
        <Text style={s.paragraph}>Nao serao consideradas Informacoes Confidenciais aquelas que:</Text>
        <Text style={s.paragraph}>a) Ja eram de dominio publico na data de sua divulgacao;</Text>
        <Text style={s.paragraph}>b) Tornarem-se publicas sem culpa da PARTE RECEPTORA;</Text>
        <Text style={s.paragraph}>c) Ja estavam legitimamente em poder da PARTE RECEPTORA;</Text>
        <Text style={s.paragraph}>d) Forem desenvolvidas independentemente pela PARTE RECEPTORA;</Text>
        <Text style={s.paragraph}>e) Forem divulgadas por determinacao judicial ou legal.</Text>

        {/* Vigencia */}
        <Text style={s.sectionTitle}>Clausula 4 — Da Vigencia</Text>
        <Text style={s.paragraph}>
          Este acordo entra em vigor na data de sua assinatura. A obrigacao de
          confidencialidade subsistira por 3 (tres) anos apos o termino da vigencia
          ou do relacionamento entre as partes, o que ocorrer por ultimo.
        </Text>

        {/* Penalidades */}
        <Text style={s.sectionTitle}>Clausula 5 — Das Penalidades</Text>
        <Text style={s.paragraph}>
          A violacao sujeitara a parte infratora ao pagamento de multa
          nao-compensatoria no valor de{" "}
          {data.totalValue > 0
            ? `${formatCurrency(data.totalValue)}`
            : "equivalente a 5% dos honorarios do contrato vinculado"}
          , sem prejuizo das perdas e danos e demais cominacoes legais cabiveis.
        </Text>

        {/* Tolerancia */}
        <Text style={s.sectionTitle}>Clausula 6 — Da Tolerancia</Text>
        <Text style={s.paragraph}>
          A tolerancia quanto a qualquer violacao sera entendida como mera
          liberalidade, nao constituindo novacao nem perda do direito de exigir o
          cumprimento das obrigacoes.
        </Text>

        <PdfCustomClauses clauses={data.customClauses} startNumber={7} />

        {/* Foro */}
        <Text style={s.sectionTitle}>Clausula 7 — Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de {forum} para dirimir quaisquer
          controversias, com renuncia expressa a qualquer outro, por mais
          privilegiado que seja.
        </Text>

        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
