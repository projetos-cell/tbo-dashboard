import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import { TBO_DEFAULTS } from "./types";
import {
  PdfHeader,
  PdfFooter,
  PdfPageHeader,
  PdfPartiesBlock,
  PdfScopeTable,
  PdfSignatures,
  PdfCustomClauses,
  formatCurrency,
  formatDate,
  valorExtenso,
} from "./pdf-shared";
import type { ContractPdfData } from "./types";

/**
 * Template Generico — Covers aditivo and general-purpose contracts
 */
export function TemplateGenerico({ data }: { data: ContractPdfData }) {
  const isAditivo = data.type === "aditivo";
  const penalty = data.penaltyPercent ?? TBO_DEFAULTS.penaltyPercent;
  const forum = data.forumCity ?? TBO_DEFAULTS.forumCity;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />

        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
            {isAditivo ? "Termo Aditivo ao Contrato" : "Contrato de Servicos"}
          </Text>
          <Text style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
            {data.title}
          </Text>
        </View>

        <PdfPartiesBlock data={data} />

        {isAditivo && (
          <View>
            <Text style={s.sectionTitle}>Do Aditamento</Text>
            <Text style={s.paragraph}>
              As partes acima qualificadas, de comum acordo, resolvem aditar o
              contrato original nos termos e condicoes abaixo especificados,
              mantendo-se inalteradas as demais clausulas nao expressamente
              modificadas por este instrumento.
            </Text>
          </View>
        )}

        {/* Objeto */}
        <Text style={s.sectionTitle}>
          Clausula Primeira — {isAditivo ? "Das Alteracoes" : "Do Objeto"}
        </Text>
        <Text style={s.paragraph}>
          {data.aiObjectClause || data.description || (
            isAditivo
              ? "O presente termo aditivo tem por objeto a alteracao das condicoes do contrato original."
              : "O presente contrato tem por objeto a prestacao dos servicos descritos no escopo abaixo."
          )}
        </Text>

        {/* Escopo */}
        {data.scopeItems.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Clausula Segunda — Do Escopo</Text>
            <PdfScopeTable data={data} />
          </View>
        )}

        {/* Vigencia */}
        <Text style={s.sectionTitle}>Clausula Terceira — Da Vigencia</Text>
        <Text style={s.paragraph}>
          {isAditivo
            ? `O presente aditivo entra em vigor em ${formatDate(data.startDate)} e tera validade ate ${formatDate(data.endDate)}.`
            : `Vigencia ate autorizacao de entrega final por escrito. Prazos negociados entre as partes.`}
        </Text>

        {/* Valor */}
        {data.totalValue > 0 && (
          <View>
            <Text style={s.sectionTitle}>Clausula Quarta — Do Valor</Text>
            <Text style={s.paragraph}>
              Valor: {formatCurrency(data.totalValue)} ({valorExtenso(data.totalValue)}).
            </Text>
            {data.paymentConditions && (
              <Text style={s.paragraph}>{data.paymentConditions}</Text>
            )}
          </View>
        )}

        {/* Confidencialidade */}
        <Text style={s.sectionTitle}>Clausula Quinta — Da Confidencialidade</Text>
        <Text style={s.paragraph}>
          As partes se comprometem a manter sigilo sobre informacoes confidenciais
          trocadas, de acordo com a LGPD (Lei n. 13.709/2018), durante e apos a
          vigencia do presente instrumento.
        </Text>

        {/* Rescisao */}
        {!isAditivo && (
          <View>
            <Text style={s.sectionTitle}>Clausula Sexta — Da Rescisao</Text>
            <Text style={s.paragraph}>
              A parte que der causa ao rompimento incorrera multa de {penalty}% sobre
              o valor total dos servicos. Direito de rescisao garantido com 60 dias
              uteis de antecedencia por escrito.
            </Text>
          </View>
        )}

        {/* Natureza Civil */}
        <Text style={s.sectionTitle}>
          Clausula {isAditivo ? "Sexta" : "Setima"} — Responsabilidade Judicial
        </Text>
        <Text style={s.paragraph}>
          Contrato de natureza estritamente civil, sem relacao de trabalho ou
          representacao comercial, regido pela boa-fe contratual do Codigo Civil.
        </Text>

        <PdfCustomClauses clauses={data.customClauses} startNumber={isAditivo ? 7 : 8} />

        {/* Disposicoes Gerais */}
        <Text style={s.sectionTitle}>Disposicoes Gerais</Text>
        <Text style={s.paragraph}>
          {isAditivo
            ? "As demais clausulas do contrato original permanecem inalteradas e em pleno vigor."
            : "Este contrato e a expressao final dos entendimentos entre as PARTES, firmado na modalidade NAO EXCLUSIVA."}
        </Text>

        {/* Foro */}
        <Text style={s.sectionTitle}>Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de {forum} para dirimir questoes ou
          litigios resultantes deste instrumento.
        </Text>

        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
