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
 * Template PJ — Instrumento Particular de Prestacao de Servicos
 * Baseado no modelo real TBO (contrato Fontanive/NewLife19)
 * 13 clausulas completas com LGPD, direitos autorais, cessao e tolerancia
 */
export function TemplatePJ({ data }: { data: ContractPdfData }) {
  const penalty = data.penaltyPercent ?? TBO_DEFAULTS.penaltyPercent;
  const latePenalty = data.latePenaltyPercent ?? TBO_DEFAULTS.latePenaltyPercent;
  const lateInterest = data.lateInterestPercent ?? TBO_DEFAULTS.lateInterestPercent;
  const noticeDays = data.terminationNoticeDays ?? TBO_DEFAULTS.terminationNoticeDays;
  const maxRevisions = data.maxRevisions ?? TBO_DEFAULTS.maxRevisions;
  const extraRevision = data.extraRevisionPercent ?? TBO_DEFAULTS.extraRevisionPercent;
  const nonExclusive = data.nonExclusive ?? TBO_DEFAULTS.nonExclusive;
  const forum = data.forumCity ?? TBO_DEFAULTS.forumCity;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader data={data} />
        <PdfFooter />
        <PdfPageHeader />

        {/* ── Partes ─────────────────────────────────────────── */}
        <PdfPartiesBlock data={data} />

        {/* ── Clausula 1 — Objeto ────────────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Primeira — Objeto do Contrato</Text>
        <Text style={s.paragraph}>
          1.1. Pelo presente instrumento e na melhor forma de direito, o CONTRATADO
          se compromete a prestar servicos especializados de{" "}
          {data.aiObjectClause || data.description || "___________________________"}{" "}
          para a CONTRATANTE
          {data.projectName
            ? `, no lancamento imobiliario em referencia ao empreendimento ${data.projectName}`
            : ""}
          , incluindo as entregas detalhadas na Clausula Segunda.
        </Text>

        {/* ── Clausula 2 — Servicos ──────────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Segunda — Dos Servicos</Text>
        <Text style={s.paragraph}>
          2.1 Os servicos serao divididos a seguir, conforme escopo detalhado:
        </Text>

        {data.aiScopeDetails ? (
          <Text style={s.paragraph}>{data.aiScopeDetails}</Text>
        ) : data.scopeItems.length > 0 ? (
          <View>
            <Text style={[s.paragraph, { marginBottom: 4 }]}>
              Detalhes do Projeto:
            </Text>
            <PdfScopeLettered data={data} />
            <View style={{ marginTop: 8 }}>
              <PdfScopeTable data={data} />
            </View>
          </View>
        ) : (
          <Text style={s.paragraph}>
            Detalhes do Projeto: conforme briefing aprovado entre as partes.
          </Text>
        )}

        <Text style={[s.paragraph, { marginTop: 8 }]}>
          2.2 — O CONTRATADO executara os servicos mediante previa e expressa
          autorizacao da CONTRATANTE. Durante o desenvolvimento dos servicos
          contratados, caso algum material especifico ultrapasse o limite de{" "}
          {maxRevisions.toString().padStart(2, "0")} ({valorExtenso(maxRevisions).replace("reais", "").trim()})
          {" "}revisoes por parte da CONTRATANTE, sera cobrado um acrescimo de{" "}
          {extraRevision}% sobre o valor total desta atividade especifica.
        </Text>

        <Text style={s.paragraph}>
          2.3 — Na ocorrencia de caso fortuito ou de forca maior o CONTRATADO nao
          podera ser responsabilizado pelo atraso na entrega dos materiais objeto do
          presente contrato de prestacao de servicos.
        </Text>

        <Text style={s.paragraph}>
          2.4 — O material que decorra da prestacao dos servicos nao podera ser
          explorado por terceiros sem a interveniencia do CONTRATADO, salvo acordo
          previo e expresso com o CONTRATADO, em que pactue justa remuneracao
          referida exploracao, nos termos do art. 9 do Decreto Federal n. 57.690 de
          1 de fevereiro de 1966. Em todo material desenvolvido pelo CONTRATADO
          deve constar seu logotipo, marca ou outro sinal distintivo de autoria.
        </Text>

        <Text style={s.paragraph}>
          2.5 — Sera ainda de inteira responsabilidade da CONTRATANTE, o
          preenchimento do briefing completo, com informacoes detalhadas sobre o
          empreendimento, servicos e necessidades especificas; o fornecimento ao
          CONTRATADO de todas as informacoes necessarias para o desenvolvimento dos
          trabalhos, esclarecendo eventuais duvidas, devendo ainda aprovar e
          autorizar formalmente os orcamentos apresentados, em antecedencia a
          qualquer liberacao de producao, pois o CONTRATADO nao autoriza, em nenhuma
          hipotese, qualquer trabalho, sem a previa aprovacao e autorizacao da
          CONTRATANTE, devendo esta revisar e aprovar todas as entregas finais antes
          de sua liberacao, responsabilizando-se por todas as informacoes contidas
          na peca.
        </Text>

        <Text style={s.paragraph}>
          2.6 — Sera tambem de responsabilidade da CONTRATANTE a aprovacao dos
          materiais sugeridos dentro do prazo solicitado de forma que o planejamento
          proposto em cronograma seja cumprido.
        </Text>

        {/* ── Clausula 3 — Prazo ─────────────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Terceira — Do Prazo</Text>
        <Text style={s.paragraph}>
          3.1 A CONTRATANTE contrata os servicos do CONTRATADO ate autorizacao da
          entrega final de todos os servicos descritos no objeto deste contrato,
          devendo essa se dar por escrito. O prazo para a entrega das atividades
          devera ser negociado entre as partes.
        </Text>

        {/* ── Clausula 4 — Confidencialidade ─────────────────── */}
        <Text style={s.sectionTitle}>Clausula Quarta — Da Confidencialidade</Text>
        <Text style={s.paragraph}>
          {data.confidentialityClause ??
            `4.1 O CONTRATADO se obriga a manter a confidencialidade dos dados, com o devido tratamento adequado, de acordo com a Lei de Protecao de Dados Pessoais (LGPD — Lei n. 13.709/2018) e de toda e qualquer informacao recebida da CONTRATANTE, efetuando o correto tratamento e nao podendo utiliza-los para outro proposito que nao seja o de realizar o servico objeto deste contrato. Todos os dados sao de propriedade exclusiva da CONTRATANTE.`}
        </Text>
        <Text style={s.paragraph}>
          4.2 Na hipotese de comprovado descumprimento de obrigacao de sigilo e
          confidencialidade estabelecida nesta clausula, o CONTRATADO pagara a
          CONTRATANTE uma multa pecuniaria equivalente a 5% do valor de seus
          honorarios, sem prejuizo de rescisao imediata deste contrato e indenizacao
          pelas perdas e danos a que der causa, a serem apuradas em acao propria.
        </Text>

        {/* ── Clausula 5 — Pagamento ─────────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Quinta — Do Pagamento</Text>
        <Text style={s.paragraph}>
          5.1 — Pelos servicos ora contratados, conforme acordado entre as PARTES,
          a CONTRATANTE pagara ao CONTRATADO{" "}
          {formatCurrency(data.totalValue)} ({valorExtenso(data.totalValue)}).
        </Text>

        {data.aiPaymentStructure ? (
          <Text style={s.paragraph}>{data.aiPaymentStructure}</Text>
        ) : data.paymentConditions ? (
          <Text style={s.paragraph}>{data.paymentConditions}</Text>
        ) : (
          <Text style={s.paragraph}>
            O pagamento sera realizado conforme as entregas aprovadas, nas condicoes
            acordadas entre as partes.
          </Text>
        )}

        <Text style={s.paragraph}>
          5.2 — O pagamento devera ser feito via{" "}
          {data.paymentMethod || "transferencia bancaria"}{" "}
          creditado na conta de titularidade do CONTRATADO
          {data.bankDetails ? `, ${data.bankDetails}` : ""}.
        </Text>

        <Text style={s.paragraph}>
          5.3 — Em caso de inadimplemento da CONTRATANTE em qualquer uma das
          parcelas sera aplicada multa de {latePenalty}% ({valorExtenso(latePenalty).replace("reais", "").trim()} por cento)
          {" "}do montante total da contratacao dos servicos, somados a correcao
          monetaria e juros moratorios de {lateInterest}% ao mes.
        </Text>

        <Text style={s.paragraph}>
          5.4 — O valor deste contrato podera ser revisto caso ocorram alteracoes no
          briefing ou na complexidade do trabalho; alteracoes de prazos
          estabelecidos; atraso por parte do Cliente na entrega de materiais; atraso
          nas aprovacoes necessarias ao desenvolvimento do trabalho; aplicacao do
          projeto em outras pecas nao especificadas nesta proposta; ou alteracao e
          aperfeicoamento de um item do projeto que extrapole a concepcao original
          do projeto.
        </Text>

        {/* ── Clausula 6 — Obrigacoes ────────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Sexta — Das Obrigacoes das Partes</Text>
        <Text style={s.paragraph}>
          6.1 — Alem de outras obrigacoes previstas no contrato, o CONTRATADO
          obriga-se:
        </Text>
        <Text style={s.paragraph}>
          I — Utilizar-se de profissionais capacitados e habilitados, para a fiel
          execucao dos servicos a serem executados;
        </Text>
        <Text style={s.paragraph}>
          II — Dar ciencia a CONTRATANTE, imediatamente, por escrito, de qualquer
          anormalidade que verificar na execucao dos servicos, que possa comprometer
          o processo ou a qualidade dos servicos;
        </Text>
        <Text style={s.paragraph}>
          III — Responder por eventuais infracoes a legislacao.
        </Text>

        {/* ── Clausula 7 — Direitos Autorais ─────────────────── */}
        <Text style={s.sectionTitle}>Clausula Setima — Dos Direitos Autorais</Text>
        <Text style={s.paragraph}>
          7.1 — Todos os trabalhos elaborados pelo CONTRATADO, incluindo todo
          material utilizado na gravacao de audio, video, material grafico, poderao
          ser utilizados pela CONTRATANTE, desde que sejam respeitados os preceitos
          legais do Decreto 57.690/66 e da Lei 9.610/98. O desrespeito a esta
          clausula protegida por preceitos legais, sujeita o infrator a responder
          por todas as penalidades judiciais cabiveis.
        </Text>

        {/* ── Clausula 8 — Responsabilidade Judicial ─────────── */}
        <Text style={s.sectionTitle}>Clausula Oitava — Responsabilidade Judicial</Text>
        <Text style={s.paragraph}>
          8.1 — O presente instrumento e um contrato de natureza estritamente civil,
          nao tendo qualquer relacao de trabalho, representacao comercial ou outros
          congeneres, devendo este ser regido pelo principio da boa-fe contratual do
          Codigo Civil.
        </Text>

        {/* ── Clausula 9 — Cessao e Sucessao ─────────────────── */}
        <Text style={s.sectionTitle}>Clausula Nona — Da Cessao e Sucessao</Text>
        <Text style={s.paragraph}>
          9.1 — E vedado as PARTES ceder ou transferir os direitos e obrigacoes
          deste contrato, salvo consentimento previo e por escrito da outra PARTE.
        </Text>
        <Text style={s.paragraph}>
          9.2 — O presente Contrato obriga as partes e seus sucessores em todos os
          seus termos, clausulas e condicoes, razao pela qual, em caso de sua venda,
          incorporacao ou cisao, a CONTRATANTE se obriga a comunicar ao seu
          "sucessor" a existencia do presente contrato que e mantido com o
          CONTRATADO.
        </Text>

        {/* ── Clausula 10 — Rescisao ─────────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Decima — Da Rescisao</Text>
        <Text style={s.paragraph}>
          10.1 — Dar-se-a por rescindido o presente contrato as partes infringirem
          qualquer uma das clausulas, pelo que se efetuara um levantamento de custos
          de todo o material que fora desenvolvido pelo CONTRATADO ate o momento da
          rescisao e caso haja valor remanescente, esse devera ser pago pela
          CONTRATANTE.
        </Text>
        <Text style={s.paragraph}>
          10.2 — A parte que der causa ao rompimento deste ajuste, incorrera multa
          contratual no montante de {penalty}% ({valorExtenso(penalty).replace("reais", "").trim()} por cento)
          {" "}sobre o valor total dos servicos contratados a qual deve ser paga de
          imediato a parte inocente sob pena de aplicacao das medidas judiciais
          cabiveis.
        </Text>
        <Text style={s.paragraph}>
          10.3 — As PARTES e garantido o direito de rescindir o presente instrumento
          a qualquer tempo, desde que comunique com {noticeDays} ({valorExtenso(noticeDays).replace("reais", "").trim()})
          {" "}dias uteis de antecedencia, por escrito.
        </Text>

        {/* ── Clausula 11 — Tolerancia ───────────────────────── */}
        <Text style={s.sectionTitle}>Clausula Decima Primeira — Da Tolerancia</Text>
        <Text style={s.paragraph}>
          11.1 — A tolerancia de qualquer uma das PARTES do presente instrumento
          quanto a qualquer violacao a dispositivos deste contrato sera sempre
          entendida como mera liberalidade, nao constituindo novacao, nao gerando,
          portanto, qualquer direito oponivel pelas partes nem a perda da
          prerrogativa em exigir, de lado a lado, o pleno cumprimento das obrigacoes
          contratuais avencadas e a da reparacao de qualquer dano.
        </Text>

        {/* ── Clausula 12 — Disposicoes Gerais ───────────────── */}
        <Text style={s.sectionTitle}>Clausula Decima Segunda — Disposicoes Gerais</Text>
        <Text style={s.paragraph}>
          12.1 — Este contrato e a expressao final dos entendimentos entre as PARTES
          referentes a seus respectivos objetivos, substituem todas as negociacoes e
          documentos por escrito entre as PARTES e/ou entre empresas as mesmas
          vinculadas, anteriormente a sua celebracao e afetos ao periodo de vigencia
          contratual.
        </Text>
        {nonExclusive && (
          <Text style={s.paragraph}>
            12.2 — O presente instrumento e firmado na modalidade NAO EXCLUSIVA,
            podendo ambas as partes firmarem outros contratos da mesma natureza ou,
            inclusive, diversos, desde que nao prejudiquem ou conflitem com os termos
            da presente avenca.
          </Text>
        )}

        {/* ── Clausulas adicionais ───────────────────────────── */}
        <PdfCustomClauses clauses={data.customClauses} startNumber={13} />

        {/* ── Clausula 13 — Foro ─────────────────────────────── */}
        <Text style={s.sectionTitle}>
          Clausula Decima Terceira — Do Foro
        </Text>
        <Text style={s.paragraph}>
          13.1 — Fica eleito o foro da Comarca de {forum} para dirimir eventuais
          questoes ou litigios resultantes deste contrato, renunciando as partes
          todo e qualquer outro, por mais privilegiado que seja.
        </Text>

        {/* ── Assinaturas ────────────────────────────────────── */}
        <PdfSignatures signers={data.signers} />
      </Page>
    </Document>
  );
}
