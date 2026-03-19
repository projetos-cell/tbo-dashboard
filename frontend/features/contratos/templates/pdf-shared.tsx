import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import type { ContractPdfData, ContractPdfSigner } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date?: string | null): string {
  if (!date) return "___/___/______";
  return new Date(date).toLocaleDateString("pt-BR");
}

function extenso(n: number): string {
  // Simplified — covers most contract values
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
          Agencia de Comunicacao
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

export function PdfFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        TBO Agencia de Comunicacao | CNPJ 00.000.000/0001-00
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

export function PdfParties({ data }: { data: ContractPdfData }) {
  return (
    <View>
      <Text style={s.sectionTitle}>Partes</Text>

      <Text style={s.clauseTitle}>CONTRATANTE</Text>
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
      <Text style={s.sectionTitle}>Escopo de Servicos</Text>

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, { width: "5%" }]}>#</Text>
          <Text style={[s.tableHeaderText, { width: "40%" }]}>Entrega</Text>
          <Text style={[s.tableHeaderText, { width: "20%" }]}>Categoria</Text>
          <Text style={[s.tableHeaderText, { width: "15%" }]}>Prazo</Text>
          <Text style={[s.tableHeaderText, { width: "20%", textAlign: "right" }]}>Valor</Text>
        </View>

        {data.scopeItems.map((item, idx) => (
          <View
            key={idx}
            style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}
          >
            <Text style={[s.tableCell, { width: "5%" }]}>{idx + 1}</Text>
            <Text style={[s.tableCell, { width: "40%" }]}>{item.title}</Text>
            <Text style={[s.tableCell, { width: "20%" }]}>
              {item.category || "—"}
            </Text>
            <Text style={[s.tableCell, { width: "15%" }]}>
              {item.estimated_end ? formatDate(item.estimated_end) : "—"}
            </Text>
            <Text style={[s.tableCell, { width: "20%", textAlign: "right" }]}>
              {formatCurrency(item.value)}
            </Text>
          </View>
        ))}

        <View style={[s.tableRow, { backgroundColor: "#f0f0f0" }]}>
          <Text style={[s.tableCell, { width: "80%", fontWeight: "bold" }]}>
            TOTAL
          </Text>
          <Text
            style={[
              s.tableCell,
              { width: "20%", textAlign: "right", fontWeight: "bold" },
            ]}
          >
            {formatCurrency(data.totalValue)}
          </Text>
        </View>
      </View>

      <Text style={s.paragraph}>
        Valor total: {formatCurrency(data.totalValue)} ({valorExtenso(data.totalValue)}).
      </Text>
    </View>
  );
}

export function PdfSignatures({ signers }: { signers: ContractPdfSigner[] }) {
  // Split into rows of 2
  const rows: ContractPdfSigner[][] = [];
  for (let i = 0; i < signers.length; i += 2) {
    rows.push(signers.slice(i, i + 2));
  }

  return (
    <View style={s.signatureBlock}>
      <Text style={s.sectionTitle}>Assinaturas</Text>

      <Text style={[s.paragraph, { marginBottom: 8 }]}>
        Local e Data: _______________, _____ de _______________ de _______.
      </Text>

      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={s.signatureRow}>
          {row.map((signer, idx) => (
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
          {row.length === 1 && <View style={{ width: "45%" }} />}
        </View>
      ))}
    </View>
  );
}

export function PdfCustomClauses({ clauses }: { clauses?: string[] }) {
  if (!clauses || clauses.length === 0) return null;

  return (
    <View>
      <Text style={s.sectionTitle}>Clausulas Adicionais</Text>
      {clauses.map((clause, idx) => (
        <View key={idx}>
          <Text style={s.clauseTitle}>
            Clausula Adicional {idx + 1}
          </Text>
          <Text style={s.paragraph}>{clause}</Text>
        </View>
      ))}
    </View>
  );
}
