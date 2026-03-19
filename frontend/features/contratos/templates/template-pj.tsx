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

export function TemplatePJ({ data }: { data: ContractPdfData }) {
  const penalty = data.penaltyPercent ?? 10;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />

        {/* Title */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
            Contrato de Prestacao de Servicos
          </Text>
          <Text style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
            {data.title}
          </Text>
        </View>

        {/* Parties */}
        <PdfParties data={data} />

        {/* Object */}
        <Text style={s.sectionTitle}>Clausula 1 — Do Objeto</Text>
        <Text style={s.paragraph}>
          O presente contrato tem por objeto a prestacao de servicos especializados pela
          CONTRATADA a CONTRATANTE, conforme escopo detalhado no Anexo I deste instrumento,
          que compreende as entregas e atividades descritas abaixo.
        </Text>
        {data.description && (
          <View style={s.highlightBox}>
            <Text style={s.paragraph}>{data.description}</Text>
          </View>
        )}

        {/* Scope */}
        <Text style={s.sectionTitle}>Clausula 2 — Do Escopo</Text>
        <PdfScopeTable data={data} />

        {/* Duration */}
        <Text style={s.sectionTitle}>Clausula 3 — Da Vigencia</Text>
        <Text style={s.paragraph}>
          O presente contrato tera vigencia de {formatDate(data.startDate)} a{" "}
          {formatDate(data.endDate)}, podendo ser prorrogado mediante termo
          aditivo assinado por ambas as partes.
        </Text>

        {/* Payment */}
        <Text style={s.sectionTitle}>Clausula 4 — Do Valor e Pagamento</Text>
        <Text style={s.paragraph}>
          Pela prestacao dos servicos descritos, a CONTRATANTE pagara a CONTRATADA o valor
          total de {formatCurrency(data.totalValue)} ({valorExtenso(data.totalValue)}).
        </Text>
        {data.paymentConditions ? (
          <Text style={s.paragraph}>{data.paymentConditions}</Text>
        ) : (
          <Text style={s.paragraph}>
            O pagamento sera realizado conforme as entregas aprovadas, via transferencia
            bancaria, no prazo de ate 15 (quinze) dias uteis apos a aprovacao de cada entrega.
          </Text>
        )}

        {/* Obligations */}
        <Text style={s.sectionTitle}>Clausula 5 — Das Obrigacoes</Text>
        <Text style={s.clauseTitle}>5.1 Obrigacoes da CONTRATADA</Text>
        <Text style={s.paragraph}>
          a) Executar os servicos com qualidade profissional e nos prazos acordados;
        </Text>
        <Text style={s.paragraph}>
          b) Manter sigilo sobre informacoes confidenciais da CONTRATANTE;
        </Text>
        <Text style={s.paragraph}>
          c) Comunicar prontamente quaisquer impedimentos a execucao dos servicos;
        </Text>
        <Text style={s.paragraph}>
          d) Emitir Nota Fiscal correspondente aos valores devidos.
        </Text>

        <Text style={s.clauseTitle}>5.2 Obrigacoes da CONTRATANTE</Text>
        <Text style={s.paragraph}>
          a) Fornecer informacoes e materiais necessarios para a execucao dos servicos;
        </Text>
        <Text style={s.paragraph}>
          b) Efetuar os pagamentos nos prazos e condicoes estabelecidos;
        </Text>
        <Text style={s.paragraph}>
          c) Designar representante para aprovacao das entregas.
        </Text>

        {/* Confidentiality */}
        <Text style={s.sectionTitle}>Clausula 6 — Da Confidencialidade</Text>
        <Text style={s.paragraph}>
          {data.confidentialityClause ??
            "As partes se comprometem a manter sigilo sobre todas as informacoes confidenciais compartilhadas durante a vigencia deste contrato, pelo prazo de 2 (dois) anos apos seu termino, sob pena de responsabilizacao civil e criminal."}
        </Text>

        {/* IP */}
        <Text style={s.sectionTitle}>
          Clausula 7 — Da Propriedade Intelectual
        </Text>
        <Text style={s.paragraph}>
          Todos os materiais, criações e entregáveis produzidos em decorrencia deste
          contrato serao de propriedade exclusiva da CONTRATANTE apos a quitacao
          integral dos valores devidos.
        </Text>

        {/* Termination */}
        <Text style={s.sectionTitle}>Clausula 8 — Da Rescisao</Text>
        <Text style={s.paragraph}>
          O presente contrato podera ser rescindido por qualquer das partes, mediante
          notificacao por escrito com antecedencia minima de 30 (trinta) dias. Em caso
          de rescisao antecipada sem justa causa, a parte que der causa pagara multa
          equivalente a {penalty}% ({valorExtenso(penalty)} por cento) do valor
          remanescente do contrato.
        </Text>

        {/* Custom clauses */}
        <PdfCustomClauses clauses={data.customClauses} />

        {/* Forum */}
        <Text style={s.sectionTitle}>Clausula 9 — Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de Sao Paulo/SP para dirimir quaisquer
          controversias oriundas deste contrato, renunciando as partes a qualquer
          outro, por mais privilegiado que seja.
        </Text>

        {/* Signatures */}
        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
