import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import {
  PdfHeader,
  PdfFooter,
  PdfParties,
  PdfSignatures,
  PdfCustomClauses,
  formatCurrency,
  formatDate,
  valorExtenso,
} from "./pdf-shared";
import type { ContractPdfData } from "./types";

export function TemplateCLT({ data }: { data: ContractPdfData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />

        {/* Title */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
            Contrato Individual de Trabalho
          </Text>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 2 }}>
            Por Prazo Determinado
          </Text>
          <Text style={{ fontSize: 9, color: "#8a8a8a", marginTop: 4 }}>
            {data.title}
          </Text>
        </View>

        {/* Parties */}
        <Text style={s.sectionTitle}>Partes</Text>
        <Text style={s.clauseTitle}>EMPREGADOR</Text>
        <View style={s.highlightBox}>
          <View style={s.row}>
            <Text style={s.labelCol}>Razao Social</Text>
            <Text style={s.valueCol}>
              {data.companyName || "TBO Agencia de Comunicacao Ltda."}
            </Text>
          </View>
          <View style={s.row}>
            <Text style={s.labelCol}>CNPJ</Text>
            <Text style={s.valueCol}>
              {data.companyCnpj || "___.___.___/____-__"}
            </Text>
          </View>
          <View style={s.row}>
            <Text style={s.labelCol}>Endereco</Text>
            <Text style={s.valueCol}>
              {data.companyAddress || "___________________________"}
            </Text>
          </View>
        </View>

        <Text style={s.clauseTitle}>EMPREGADO(A)</Text>
        <View style={s.highlightBox}>
          <View style={s.row}>
            <Text style={s.labelCol}>Nome Completo</Text>
            <Text style={s.valueCol}>
              {data.contracteeName || data.signers[0]?.name || "___________________________"}
            </Text>
          </View>
          <View style={s.row}>
            <Text style={s.labelCol}>CPF</Text>
            <Text style={s.valueCol}>
              {data.contracteeCpf || data.signers[0]?.cpf || "___.___.___-__"}
            </Text>
          </View>
          <View style={s.row}>
            <Text style={s.labelCol}>E-mail</Text>
            <Text style={s.valueCol}>
              {data.signers[0]?.email || "___________________________"}
            </Text>
          </View>
          {data.contracteeAddress && (
            <View style={s.row}>
              <Text style={s.labelCol}>Endereco</Text>
              <Text style={s.valueCol}>{data.contracteeAddress}</Text>
            </View>
          )}
        </View>

        {/* Object */}
        <Text style={s.sectionTitle}>Clausula 1 — Do Objeto</Text>
        <Text style={s.paragraph}>
          O(A) EMPREGADO(A) e contratado(a) para exercer a funcao de{" "}
          {data.description || "___________________________"}, comprometendo-se
          a executar as atividades inerentes ao cargo com dedicacao e diligencia.
        </Text>

        {/* Duration */}
        <Text style={s.sectionTitle}>Clausula 2 — Do Prazo</Text>
        <Text style={s.paragraph}>
          O presente contrato de trabalho tera vigencia por prazo determinado,
          iniciando-se em {formatDate(data.startDate)} e encerrando-se em{" "}
          {formatDate(data.endDate)}, nos termos do artigo 443, paragrafo 2,
          alinea "a" da CLT.
        </Text>
        <Text style={s.paragraph}>
          Findo o prazo estipulado, o contrato podera ser renovado uma unica vez,
          desde que a soma dos periodos nao ultrapasse 2 (dois) anos, sob pena de
          considerar-se por prazo indeterminado.
        </Text>

        {/* Compensation */}
        <Text style={s.sectionTitle}>Clausula 3 — Da Remuneracao</Text>
        <Text style={s.paragraph}>
          O(A) EMPREGADO(A) recebera remuneracao mensal bruta de{" "}
          {formatCurrency(data.totalValue)} ({valorExtenso(data.totalValue)}),
          paga ate o 5o (quinto) dia util do mes subsequente ao trabalhado,
          mediante deposito bancario.
        </Text>

        {/* Working hours */}
        <Text style={s.sectionTitle}>Clausula 4 — Da Jornada de Trabalho</Text>
        <Text style={s.paragraph}>
          A jornada de trabalho sera de 44 (quarenta e quatro) horas semanais,
          de segunda a sexta-feira, das 09h00 as 18h00, com intervalo de 1 (uma)
          hora para refeicao.
        </Text>

        {/* Benefits */}
        <Text style={s.sectionTitle}>Clausula 5 — Dos Beneficios</Text>
        <Text style={s.paragraph}>
          Alem da remuneracao, o(a) EMPREGADO(A) tera direito a: vale-transporte,
          vale-refeicao e demais beneficios legais previstos na legislacao trabalhista
          e em convencao coletiva aplicavel.
        </Text>

        {/* Obligations */}
        <Text style={s.sectionTitle}>Clausula 6 — Das Obrigacoes</Text>
        <Text style={s.paragraph}>
          O(A) EMPREGADO(A) compromete-se a: (a) exercer suas funcoes com zelo e
          responsabilidade; (b) cumprir as normas internas da empresa; (c) manter
          sigilo sobre informacoes confidenciais; (d) nao exercer atividades
          concorrentes durante a vigencia do contrato.
        </Text>

        {/* Confidentiality */}
        <Text style={s.sectionTitle}>Clausula 7 — Da Confidencialidade</Text>
        <Text style={s.paragraph}>
          O(A) EMPREGADO(A) obriga-se a manter em absoluto sigilo todas as informacoes
          e dados aos quais tenha acesso em decorrencia de suas atividades, durante
          e apos o termino do vinculo empregaticio, sob pena de responsabilizacao
          civil e criminal.
        </Text>

        {/* Termination */}
        <Text style={s.sectionTitle}>Clausula 8 — Da Rescisao</Text>
        <Text style={s.paragraph}>
          A rescisao antecipada deste contrato observara as disposicoes legais
          aplicaveis (artigos 479 e 480 da CLT), ficando a parte que der causa
          sujeita ao pagamento de indenizacao correspondente a metade da remuneracao
          a que o(a) EMPREGADO(A) teria direito ate o final do contrato.
        </Text>

        {/* Custom clauses */}
        <PdfCustomClauses clauses={data.customClauses} />

        {/* Forum */}
        <Text style={s.sectionTitle}>Clausula 9 — Do Foro</Text>
        <Text style={s.paragraph}>
          Fica eleito o foro da Comarca de Sao Paulo/SP para dirimir quaisquer
          controversias oriundas deste contrato de trabalho.
        </Text>

        {/* Signatures */}
        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
