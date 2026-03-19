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

export function TemplateFreelancer({ data }: { data: ContractPdfData }) {
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
          <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 2 }}>
            Profissional Autonomo / Freelancer
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
          O presente instrumento tem por objeto a contratacao de servicos
          especializados do(a) CONTRATADO(A), na qualidade de profissional autonomo,
          para execucao das entregas descritas no escopo abaixo, sem vinculo
          empregaticio de qualquer natureza.
        </Text>
        {data.description && (
          <View style={s.highlightBox}>
            <Text style={s.paragraph}>{data.description}</Text>
          </View>
        )}

        {/* Scope */}
        <Text style={s.sectionTitle}>Clausula 2 — Do Escopo e Entregas</Text>
        <PdfScopeTable data={data} />

        {/* Duration */}
        <Text style={s.sectionTitle}>Clausula 3 — Do Prazo</Text>
        <Text style={s.paragraph}>
          Os servicos serao prestados no periodo de {formatDate(data.startDate)} a{" "}
          {formatDate(data.endDate)}, podendo ser prorrogado mediante acordo escrito
          entre as partes.
        </Text>

        {/* Payment */}
        <Text style={s.sectionTitle}>Clausula 4 — Da Remuneracao</Text>
        <Text style={s.paragraph}>
          Pela execucao integral dos servicos, a CONTRATANTE pagara ao(a) CONTRATADO(A)
          o valor total de {formatCurrency(data.totalValue)} ({valorExtenso(data.totalValue)}).
        </Text>
        <Text style={s.paragraph}>
          {data.paymentConditions ??
            "O pagamento sera realizado via transferencia bancaria (PIX ou TED) em ate 10 (dez) dias uteis apos a aprovacao de cada entrega, mediante envio do respectivo Recibo de Pagamento Autonomo (RPA) ou Nota Fiscal."}
        </Text>

        {/* Autonomy */}
        <Text style={s.sectionTitle}>Clausula 5 — Da Autonomia</Text>
        <Text style={s.paragraph}>
          O(A) CONTRATADO(A) executara os servicos com total autonomia tecnica e
          profissional, definindo seus proprios horarios, metodos e local de trabalho,
          nao se configurando, em hipotese alguma, relacao de emprego, subordinacao
          ou exclusividade.
        </Text>

        {/* IP */}
        <Text style={s.sectionTitle}>Clausula 6 — Da Propriedade Intelectual</Text>
        <Text style={s.paragraph}>
          Todos os materiais produzidos em decorrencia deste contrato, incluindo
          arquivos-fonte, criações e documentacoes, serao de propriedade exclusiva
          da CONTRATANTE apos a quitacao integral dos valores. O(A) CONTRATADO(A)
          podera utilizar os trabalhos em portfolio pessoal, salvo disposicao
          contraria expressa.
        </Text>

        {/* Confidentiality */}
        <Text style={s.sectionTitle}>Clausula 7 — Da Confidencialidade</Text>
        <Text style={s.paragraph}>
          {data.confidentialityClause ??
            "O(A) CONTRATADO(A) se compromete a manter sigilo sobre todas as informacoes a que tiver acesso durante a prestacao dos servicos, por prazo indeterminado apos o termino do contrato."}
        </Text>

        {/* Termination */}
        <Text style={s.sectionTitle}>Clausula 8 — Da Rescisao</Text>
        <Text style={s.paragraph}>
          Qualquer das partes podera rescindir este contrato mediante comunicacao
          escrita com antecedencia minima de 15 (quinze) dias. Os servicos ja
          executados e aprovados ate a data da rescisao serao remunerados
          proporcionalmente.
        </Text>

        {/* Custom clauses */}
        <PdfCustomClauses clauses={data.customClauses} />

        {/* Forum */}
        <Text style={s.sectionTitle}>Clausula 9 — Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de Sao Paulo/SP para dirimir quaisquer
          controversias decorrentes deste contrato.
        </Text>

        {/* Signatures */}
        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
