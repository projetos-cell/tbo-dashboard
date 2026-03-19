import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import { TBO_DEFAULTS } from "./types";
import {
  PdfHeader,
  PdfFooter,
  PdfPageHeader,
  PdfPartiesBlock,
  PdfScopeLettered,
  PdfScopeTable,
  PdfSignatures,
  PdfCustomClauses,
  formatCurrency,
  valorExtenso,
} from "./pdf-shared";
import type { ContractPdfData } from "./types";

/**
 * Template Freelancer — Prestacao de servicos autonomo
 * Sem vinculo empregaticio, baseado no padrao TBO com LGPD
 */
export function TemplateFreelancer({ data }: { data: ContractPdfData }) {
  const penalty = data.penaltyPercent ?? TBO_DEFAULTS.penaltyPercent;
  const latePenalty = data.latePenaltyPercent ?? TBO_DEFAULTS.latePenaltyPercent;
  const lateInterest = data.lateInterestPercent ?? TBO_DEFAULTS.lateInterestPercent;
  const maxRevisions = data.maxRevisions ?? TBO_DEFAULTS.maxRevisions;
  const extraRevision = data.extraRevisionPercent ?? TBO_DEFAULTS.extraRevisionPercent;
  const forum = data.forumCity ?? TBO_DEFAULTS.forumCity;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />
        <PdfPageHeader />

        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 10, color: "#4a4a4a" }}>
            Profissional Autonomo / Freelancer
          </Text>
        </View>

        <PdfPartiesBlock data={data} />

        {/* Clausula 1 — Objeto */}
        <Text style={s.sectionTitle}>Clausula Primeira — Objeto do Contrato</Text>
        <Text style={s.paragraph}>
          1.1 — O presente instrumento tem por objeto a contratacao de servicos
          especializados do(a) CONTRATADO(A), na qualidade de profissional autonomo,
          para execucao das entregas descritas na Clausula Segunda, sem vinculo
          empregaticio de qualquer natureza.
        </Text>
        {data.description && (
          <View style={s.highlightBox}>
            <Text style={s.paragraph}>{data.aiObjectClause || data.description}</Text>
          </View>
        )}

        {/* Clausula 2 — Servicos */}
        <Text style={s.sectionTitle}>Clausula Segunda — Dos Servicos</Text>
        {data.scopeItems.length > 0 ? (
          <View>
            <Text style={s.paragraph}>2.1 Os servicos compreendem:</Text>
            <PdfScopeLettered data={data} />
            <View style={{ marginTop: 8 }}>
              <PdfScopeTable data={data} />
            </View>
          </View>
        ) : (
          <Text style={s.paragraph}>2.1 Conforme briefing aprovado entre as partes.</Text>
        )}
        <Text style={s.paragraph}>
          2.2 — Caso algum material ultrapasse o limite de {maxRevisions} revisoes,
          sera cobrado acrescimo de {extraRevision}% sobre o valor da atividade.
        </Text>

        {/* Clausula 3 — Prazo */}
        <Text style={s.sectionTitle}>Clausula Terceira — Do Prazo</Text>
        <Text style={s.paragraph}>
          3.1 — Os servicos serao prestados ate autorizacao da entrega final, devendo
          essa se dar por escrito. Prazos especificos serao negociados entre as partes.
        </Text>

        {/* Clausula 4 — Autonomia */}
        <Text style={s.sectionTitle}>Clausula Quarta — Da Autonomia</Text>
        <Text style={s.paragraph}>
          4.1 — O(A) CONTRATADO(A) executara os servicos com total autonomia tecnica
          e profissional, definindo seus proprios horarios, metodos e local de trabalho,
          nao se configurando, em hipotese alguma, relacao de emprego, subordinacao
          ou exclusividade.
        </Text>

        {/* Clausula 5 — Confidencialidade */}
        <Text style={s.sectionTitle}>Clausula Quinta — Da Confidencialidade</Text>
        <Text style={s.paragraph}>
          5.1 — O CONTRATADO se obriga a manter a confidencialidade dos dados, de
          acordo com a Lei de Protecao de Dados Pessoais (LGPD — Lei n. 13.709/2018)
          e de toda e qualquer informacao recebida da CONTRATANTE. Todos os dados
          sao de propriedade exclusiva da CONTRATANTE.
        </Text>
        <Text style={s.paragraph}>
          5.2 — Na hipotese de descumprimento, o CONTRATADO pagara multa de 5% do
          valor de seus honorarios, sem prejuizo de rescisao e indenizacao.
        </Text>

        {/* Clausula 6 — Pagamento */}
        <Text style={s.sectionTitle}>Clausula Sexta — Do Pagamento</Text>
        <Text style={s.paragraph}>
          6.1 — A CONTRATANTE pagara ao CONTRATADO {formatCurrency(data.totalValue)}{" "}
          ({valorExtenso(data.totalValue)}).
        </Text>
        {data.paymentConditions ? (
          <Text style={s.paragraph}>{data.paymentConditions}</Text>
        ) : (
          <Text style={s.paragraph}>
            Pagamento via {data.paymentMethod || "PIX ou TED"} em ate 10 dias
            uteis apos aprovacao de cada entrega, mediante envio de RPA ou Nota Fiscal.
          </Text>
        )}
        <Text style={s.paragraph}>
          6.2 — Inadimplemento: multa de {latePenalty}% + correcao monetaria + juros
          de {lateInterest}% ao mes.
        </Text>

        {/* Clausula 7 — Direitos Autorais */}
        <Text style={s.sectionTitle}>Clausula Setima — Dos Direitos Autorais</Text>
        <Text style={s.paragraph}>
          7.1 — Todos os materiais produzidos, incluindo arquivos-fonte, serao de
          propriedade da CONTRATANTE apos quitacao, respeitados os preceitos do
          Decreto 57.690/66 e da Lei 9.610/98. O(A) CONTRATADO(A) podera utilizar
          os trabalhos em portfolio pessoal, salvo acordo contrario.
        </Text>

        {/* Clausula 8 — Natureza Civil */}
        <Text style={s.sectionTitle}>Clausula Oitava — Responsabilidade Judicial</Text>
        <Text style={s.paragraph}>
          8.1 — O presente instrumento e de natureza estritamente civil, nao tendo
          qualquer relacao de trabalho, representacao comercial ou congeneres.
        </Text>

        {/* Clausula 9 — Rescisao */}
        <Text style={s.sectionTitle}>Clausula Nona — Da Rescisao</Text>
        <Text style={s.paragraph}>
          9.1 — Qualquer das partes podera rescindir mediante comunicacao escrita com
          15 dias de antecedencia. Servicos executados e aprovados serao remunerados
          proporcionalmente.
        </Text>
        <Text style={s.paragraph}>
          9.2 — A parte que der causa incidira em multa de {penalty}% sobre o valor
          total dos servicos contratados.
        </Text>

        {/* Clausula 10 — Tolerancia */}
        <Text style={s.sectionTitle}>Clausula Decima — Da Tolerancia</Text>
        <Text style={s.paragraph}>
          10.1 — A tolerancia quanto a qualquer violacao sera entendida como mera
          liberalidade, nao constituindo novacao.
        </Text>

        <PdfCustomClauses clauses={data.customClauses} startNumber={11} />

        {/* Foro */}
        <Text style={s.sectionTitle}>Clausula Decima Primeira — Do Foro</Text>
        <Text style={s.paragraph}>
          11.1 — Fica eleito o foro da Comarca de {forum} para dirimir eventuais
          questoes ou litigios resultantes deste contrato.
        </Text>

        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
