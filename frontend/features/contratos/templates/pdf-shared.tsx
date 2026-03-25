import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import { TBO_DEFAULTS } from "./types";
import type { ContractPdfData, ContractPdfSigner } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date?: string | null): string {
  if (!date) return "___/___/______";
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatDateLong(date?: string | null): string {
  if (!date) return "_____ de _______________ de _______";
  const d = new Date(date);
  const months = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

function extenso(n: number): string {
  const units = ["", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (n === 0) return "zero";
  if (n === 100) return "cem";

  const parts: string[] = [];

  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    parts.push(millions === 1 ? "um milhao" : `${extenso(millions)} milhoes`);
    n %= 1000000;
    if (n > 0) parts.push("e");
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    parts.push(thousands === 1 ? "mil" : `${extenso(thousands)} mil`);
    n %= 1000;
    if (n > 0) parts.push("e");
  }

  if (n >= 100) {
    if (n === 100) {
      parts.push("cem");
      return parts.join(" ");
    }
    parts.push(hundreds[Math.floor(n / 100)]);
    n %= 100;
    if (n > 0) parts.push("e");
  }

  if (n >= 20) {
    parts.push(tens[Math.floor(n / 10)]);
    n %= 10;
    if (n > 0) parts.push("e");
  }

  if (n >= 10) {
    parts.push(teens[n - 10]);
  } else if (n > 0) {
    parts.push(units[n]);
  }

  return parts.join(" ");
}

export function valorExtenso(value: number): string {
  const inteiro = Math.floor(value);
  const centavos = Math.round((value - inteiro) * 100);
  let result = `${extenso(inteiro)} reais`;
  if (centavos > 0) {
    result += ` e ${extenso(centavos)} centavos`;
  }
  return result;
}

const SIGNER_ROLE_LABELS: Record<string, string> = {
  contractor: "CONTRATANTE",
  contractee: "CONTRATADO",
  signer: "Signatario",
  witness: "Testemunha",
  approver: "Aprovador",
};

// ─── Reusable PDF sections ────────────────────────────────────────────────────

export function PdfHeader({ data }: { data: ContractPdfData }) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.headerBrand}>TBO</Text>
        <Text style={{ fontSize: 8, color: "#8a8a8a", marginTop: 2 }}>
          Agencia de Publicidade
        </Text>
      </View>
      <View style={s.headerMeta}>
        {data.contractNumber && (
          <Text>{data.contractNumber}</Text>
        )}
        <Text>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
      </View>
    </View>
  );
}

/** Repeated header on every page */
export function PdfPageHeader() {
  return (
    <View
      style={{
        textAlign: "center",
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
      }}
      fixed
    >
      <Text style={{ fontSize: 9, fontWeight: "bold", letterSpacing: 1, color: "#4a4a4a" }}>
        INSTRUMENTO PARTICULAR DE PRESTACAO DE SERVICOS
      </Text>
    </View>
  );
}

export function PdfFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        {TBO_DEFAULTS.companyName} | CNPJ {TBO_DEFAULTS.companyCnpj}
      </Text>
      <Text
        style={s.footerPage}
        render={({ pageNumber, totalPages }) =>
          `Pagina ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  );
}

/** Narrative-style parties block (like real TBO contracts) */
export function PdfPartiesBlock({ data }: { data: ContractPdfData }) {
  return (
    <View>
      <Text style={s.paragraph}>
        Pelo presente instrumento particular, as partes abaixo nomeadas e qualificadas, a saber:
      </Text>

      <Text style={[s.paragraph, { marginTop: 8 }]}>
        <Text style={{ fontWeight: "bold" }}>
          {data.companyName || TBO_DEFAULTS.companyName}
        </Text>
        , pessoa juridica de direito privado inscrita no CNPJ/MF sob o n.{" "}
        {data.companyCnpj || TBO_DEFAULTS.companyCnpj}, com sede na{" "}
        {data.companyAddress || TBO_DEFAULTS.companyAddress}
        {data.companyRepresentative
          ? `, neste ato por seu representante legal ${data.companyRepresentative}`
          : ", neste ato por seu representante legal"}
        , doravante apenas "CONTRATANTE";
      </Text>

      <Text style={[s.paragraph, { marginTop: 8 }]}>
        <Text style={{ fontWeight: "bold" }}>
          {data.contracteeName || data.signers[0]?.name || "___________________________"}
        </Text>
        , pessoa juridica de direito privado inscrita no{" "}
        {data.contracteeCnpj
          ? `CNPJ/MF sob o n. ${data.contracteeCnpj}`
          : data.contracteeCpf
            ? `CPF sob o n. ${data.contracteeCpf}`
            : "CNPJ/MF sob o n. ___.___.___/____-__"}
        {data.contracteeAddress
          ? `, com endereco na ${data.contracteeAddress}`
          : ""}
        {data.contracteeRepresentative
          ? `, neste ato por seu representante legal ${data.contracteeRepresentative}`
          : ""}
        , doravante apenas "CONTRATADO", tem, entre si, atraves do presente
        instrumento particular de prestacao de servicos.
      </Text>

      <Text style={[s.paragraph, { marginTop: 8, fontWeight: "bold" }]}>
        RESOLVEM AS PARTES, firmar o presente contrato, conforme os termos,
        clausulas e condicoes que abaixo livremente estipulam, aceitam, outorgam e
        pactuam, obrigando-se a cumpri-las a qualquer tempo, por si e por seus
        herdeiros e sucessores a qualquer titulo:
      </Text>
    </View>
  );
}

/** Box-format parties (for NDA, CLT, etc.) */
export function PdfParties({ data }: { data: ContractPdfData }) {
  return (
    <View>
      <Text style={s.sectionTitle}>Partes</Text>

      <Text style={s.clauseTitle}>CONTRATANTE</Text>
      <View style={s.highlightBox}>
        <View style={s.row}>
          <Text style={s.labelCol}>Razao Social</Text>
          <Text style={s.valueCol}>
            {data.companyName || TBO_DEFAULTS.companyName}
          </Text>
        </View>
        <View style={s.row}>
          <Text style={s.labelCol}>CNPJ</Text>
          <Text style={s.valueCol}>
            {data.companyCnpj || TBO_DEFAULTS.companyCnpj}
          </Text>
        </View>
        <View style={s.row}>
          <Text style={s.labelCol}>Endereco</Text>
          <Text style={s.valueCol}>
            {data.companyAddress || TBO_DEFAULTS.companyAddress}
          </Text>
        </View>
      </View>

      <Text style={s.clauseTitle}>CONTRATADO(A)</Text>
      <View style={s.highlightBox}>
        <View style={s.row}>
          <Text style={s.labelCol}>Nome / Razao Social</Text>
          <Text style={s.valueCol}>
            {data.contracteeName || data.signers[0]?.name || "___________________________"}
          </Text>
        </View>
        {(data.contracteeCnpj || data.type === "pj") && (
          <View style={s.row}>
            <Text style={s.labelCol}>CNPJ</Text>
            <Text style={s.valueCol}>
              {data.contracteeCnpj || "___.___.___/____-__"}
            </Text>
          </View>
        )}
        {(data.contracteeCpf || data.type !== "pj") && (
          <View style={s.row}>
            <Text style={s.labelCol}>CPF</Text>
            <Text style={s.valueCol}>
              {data.contracteeCpf || data.signers[0]?.cpf || "___.___.___-__"}
            </Text>
          </View>
        )}
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
    </View>
  );
}

export function PdfScopeTable({ data }: { data: ContractPdfData }) {
  if (data.scopeItems.length === 0) return null;

  return (
    <View>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, { width: "5%" }]}>#</Text>
          <Text style={[s.tableHeaderText, { width: "45%" }]}>Entrega</Text>
          <Text style={[s.tableHeaderText, { width: "20%" }]}>Categoria</Text>
          <Text style={[s.tableHeaderText, { width: "15%" }]}>Prazo</Text>
          <Text style={[s.tableHeaderText, { width: "15%", textAlign: "right" }]}>Valor</Text>
        </View>

        {data.scopeItems.map((item, idx) => (
          <View
            key={idx}
            style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}
          >
            <Text style={[s.tableCell, { width: "5%" }]}>{idx + 1}</Text>
            <View style={{ width: "45%" }}>
              <Text style={s.tableCell}>{item.title}</Text>
              {item.description && (
                <Text style={[s.tableCell, { fontSize: 7, color: "#8a8a8a" }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <Text style={[s.tableCell, { width: "20%" }]}>
              {item.category || "—"}
            </Text>
            <Text style={[s.tableCell, { width: "15%" }]}>
              {item.estimated_end ? formatDate(item.estimated_end) : "—"}
            </Text>
            <Text style={[s.tableCell, { width: "15%", textAlign: "right" }]}>
              {formatCurrency(item.value)}
            </Text>
          </View>
        ))}

        <View style={[s.tableRow, { backgroundColor: "#f0f0f0" }]}>
          <Text style={[s.tableCell, { width: "85%", fontWeight: "bold" }]}>
            TOTAL
          </Text>
          <Text
            style={[
              s.tableCell,
              { width: "15%", textAlign: "right", fontWeight: "bold" },
            ]}
          >
            {formatCurrency(data.totalValue)}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Lettered scope list (a, b, c) — matches TBO contract style */
export function PdfScopeLettered({ data }: { data: ContractPdfData }) {
  if (data.scopeItems.length === 0) return null;
  const letters = "abcdefghijklmnopqrstuvwxyz";

  return (
    <View>
      {data.scopeItems.map((item, idx) => (
        <Text key={idx} style={s.paragraph}>
          {letters[idx] ?? `${idx + 1}`}) {item.title}
          {item.description ? ` - ${item.description}` : ""};
        </Text>
      ))}
    </View>
  );
}

export function PdfSignatures({ signers }: { signers: ContractPdfSigner[] }) {
  // Separate by party role: contratante, contratado, then other signers
  const contractors = signers.filter((sn) => sn.role === "contractor");
  const contractees = signers.filter((sn) => sn.role === "contractee");
  const otherSigners = signers.filter(
    (sn) => sn.role === "signer" || sn.role === "approver"
  );
  const witnesses = signers.filter((sn) => sn.role === "witness");

  // Build main signature pairs: contractor + contractee first, then extras
  const mainSigners = [...contractors, ...contractees, ...otherSigners];

  return (
    <View style={s.signatureBlock}>
      <Text style={[s.paragraph, { marginBottom: 4 }]}>
        E, por estarem, assim, justos e contratados, lavram, datam e assinam o
        presente em duas vias de igual teor e forma, juntamente com duas
        testemunhas de real valor.
      </Text>

      <Text style={[s.paragraph, { marginBottom: 20 }]}>
        Curitiba, {formatDateLong(null)}.
      </Text>

      {/* Main signers — contractor + contractee */}
      <View style={s.signatureRow}>
        {mainSigners.length > 0 ? (
          mainSigners.slice(0, 2).map((signer, idx) => (
            <View key={idx} style={s.signatureItem}>
              <View style={s.signatureLine} />
              <Text style={s.signatureName}>{signer.name}</Text>
              <Text style={s.signatureRole}>
                {SIGNER_ROLE_LABELS[signer.role] ?? signer.role}
              </Text>
              {signer.cpf && (
                <Text style={s.signatureCpf}>CPF: {signer.cpf}</Text>
              )}
            </View>
          ))
        ) : (
          <>
            <View style={s.signatureItem}>
              <View style={s.signatureLine} />
              <Text style={s.signatureName}>CONTRATANTE</Text>
            </View>
            <View style={s.signatureItem}>
              <View style={s.signatureLine} />
              <Text style={s.signatureName}>CONTRATADO</Text>
            </View>
          </>
        )}
      </View>

      {/* Additional signers beyond the first pair */}
      {mainSigners.length > 2 && (
        <View style={[s.signatureRow, { marginTop: 16 }]}>
          {mainSigners.slice(2, 4).map((signer, idx) => (
            <View key={idx} style={s.signatureItem}>
              <View style={s.signatureLine} />
              <Text style={s.signatureName}>{signer.name}</Text>
              <Text style={s.signatureRole}>
                {SIGNER_ROLE_LABELS[signer.role] ?? signer.role}
              </Text>
              {signer.cpf && (
                <Text style={s.signatureCpf}>CPF: {signer.cpf}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Witnesses */}
      {witnesses.length > 0 ? (
        <View>
          <Text style={[s.clauseTitle, { marginTop: 24, textAlign: "center" }]}>
            Testemunhas
          </Text>
          <View style={s.signatureRow}>
            {witnesses.slice(0, 2).map((w, idx) => (
              <View key={idx} style={s.signatureItem}>
                <View style={s.signatureLine} />
                <Text style={s.signatureName}>{w.name}</Text>
                {w.cpf && (
                  <Text style={s.signatureCpf}>CPF: {w.cpf}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View>
          <Text style={[s.clauseTitle, { marginTop: 24, textAlign: "center" }]}>
            Testemunhas
          </Text>
          <View style={s.signatureRow}>
            <View style={s.signatureItem}>
              <View style={s.signatureLine} />
              <Text style={s.signatureCpf}>CPF: ___.___.___-__</Text>
            </View>
            <View style={s.signatureItem}>
              <View style={s.signatureLine} />
              <Text style={s.signatureCpf}>CPF: ___.___.___-__</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export function PdfCustomClauses({
  clauses,
  startNumber,
}: {
  clauses?: string[];
  startNumber?: number;
}) {
  if (!clauses || clauses.length === 0) return null;

  return (
    <View>
      {clauses.map((clause, idx) => {
        const num = (startNumber ?? 14) + idx;
        return (
          <View key={idx}>
            <Text style={s.sectionTitle}>
              Clausula {num} — Clausula Adicional
            </Text>
            <Text style={s.paragraph}>{clause}</Text>
          </View>
        );
      })}
    </View>
  );
}
