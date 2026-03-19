import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import {
  PdfHeader,
  PdfFooter,
  PdfParties,
  PdfScopeTable,
  PdfSignatures,
  PdfCustomClauses,
  formatCurrency,
  formatDate,
  valorExtenso,
} from "./pdf-shared";
import type { ContractPdfData } from "./types";

/**
 * Generic contract template — covers aditivo and general-purpose contracts.
 * Used as fallback when no specific template matches.
 */
export function TemplateGenerico({ data }: { data: ContractPdfData }) {
  const isAditivo = data.type === "aditivo";
  const penalty = data.penaltyPercent ?? 10;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />

        {/* Title */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
            {isAditivo ? "Termo Aditivo ao Contrato" : "Contrato de Servicos"}
          </Text>
          <Text style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
            {data.title}
          </Text>
        </View>

        {/* Parties */}
        <PdfParties data={data} />

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

        {/* Object */}
        <Text style={s.sectionTitle}>Clausula 1 — Do Objeto</Text>
        <Text style={s.paragraph}>
          {isAditivo
            ? "O presente termo aditivo tem por objeto a alteracao das condicoes do contrato original, conforme descricao abaixo:"
            : "O presente contrato tem por objeto a prestacao dos servicos descritos no escopo abaixo, pela CONTRATADA a CONTRATANTE, nas condicoes aqui estipuladas."}
        </Text>
        {data.description && (
          <View style={s.highlightBox}>
            <Text style={s.paragraph}>{data.description}</Text>
          </View>
        )}

        {/* Scope */}
        {data.scopeItems.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>
              Clausula 2 — {isAditivo ? "Das Alteracoes no Escopo" : "Do Escopo"}
            </Text>
            <PdfScopeTable data={data} />
          </View>
        )}

        {/* Duration */}
        <Text style={s.sectionTitle}>Clausula 3 — Da Vigencia</Text>
        <Text style={s.paragraph}>
          {isAditivo
            ? `O presente aditivo entra em vigor em ${formatDate(data.startDate)} e tera validade ate ${formatDate(data.endDate)}.`
            : `O presente contrato tera vigencia de ${formatDate(data.startDate)} a ${formatDate(data.endDate)}, podendo ser prorrogado mediante acordo escrito entre as partes.`}
        </Text>

        {/* Payment */}
        {data.totalValue > 0 && (
          <View>
            <Text style={s.sectionTitle}>Clausula 4 — Do Valor</Text>
            <Text style={s.paragraph}>
              {isAditivo
                ? `O valor do presente aditivo e de ${formatCurrency(data.totalValue)} (${valorExtenso(data.totalValue)}), que sera acrescido ao valor do contrato original.`
                : `O valor total dos servicos e de ${formatCurrency(data.totalValue)} (${valorExtenso(data.totalValue)}).`}
            </Text>
            {data.paymentConditions && (
              <Text style={s.paragraph}>{data.paymentConditions}</Text>
            )}
          </View>
        )}

        {/* Confidentiality */}
        <Text style={s.sectionTitle}>
          Clausula 5 — Da Confidencialidade
        </Text>
        <Text style={s.paragraph}>
          {data.confidentialityClause ??
            "As partes se comprometem a manter sigilo sobre informacoes confidenciais trocadas durante e apos a vigencia do presente instrumento."}
        </Text>

        {/* Termination */}
        {!isAditivo && (
          <View>
            <Text style={s.sectionTitle}>Clausula 6 — Da Rescisao</Text>
            <Text style={s.paragraph}>
              O presente contrato podera ser rescindido por qualquer das partes
              mediante notificacao escrita com 30 (trinta) dias de antecedencia.
              A parte que rescindir sem justa causa arcara com multa de {penalty}%
              sobre o valor remanescente.
            </Text>
          </View>
        )}

        {/* Custom clauses */}
        <PdfCustomClauses clauses={data.customClauses} />

        {/* General provisions */}
        <Text style={s.sectionTitle}>Disposicoes Gerais</Text>
        <Text style={s.paragraph}>
          {isAditivo
            ? "As demais clausulas e condicoes do contrato original permanecem inalteradas e em pleno vigor."
            : "Os casos omissos serao resolvidos de comum acordo entre as partes, prevalecendo os principios de boa-fe e probidade."}
        </Text>

        {/* Forum */}
        <Text style={s.sectionTitle}>Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de Sao Paulo/SP para dirimir quaisquer
          controversias oriundas deste instrumento.
        </Text>

        {/* Signatures */}
        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
