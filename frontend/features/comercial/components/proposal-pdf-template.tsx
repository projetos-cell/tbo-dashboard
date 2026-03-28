import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { ProposalWithItems } from "@/features/comercial/services/proposals";
import type { ProposalItemRow } from "@/features/comercial/services/proposals";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#18181B",
  accent: "#E85102",
  gray50: "#FAFAFA",
  gray100: "#F4F4F5",
  gray200: "#E4E4E7",
  gray400: "#A1A1AA",
  gray500: "#71717A",
  gray700: "#3F3F46",
  gray900: "#18181B",
  white: "#FFFFFF",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: COLORS.white,
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 10,
    color: COLORS.gray900,
    lineHeight: 1.4,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: {
    flexDirection: "column",
    gap: 4,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 8,
    color: COLORS.gray400,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3,
  },
  refCode: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
  },
  headerDate: {
    fontSize: 9,
    color: COLORS.gray500,
  },

  // Section title
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 20,
  },

  // Client info
  clientSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  clientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  clientField: {
    flexDirection: "column",
    gap: 2,
    minWidth: 140,
    flex: 1,
  },
  clientLabel: {
    fontSize: 8,
    color: COLORS.gray400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  clientValue: {
    fontSize: 10,
    color: COLORS.gray900,
    fontFamily: "Helvetica-Bold",
  },

  // Proposal name banner
  proposalBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  proposalBannerTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    marginBottom: 3,
  },
  proposalBannerSub: {
    fontSize: 9,
    color: COLORS.gray400,
  },

  // Items table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  tableRowAlt: {
    backgroundColor: COLORS.gray50,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.gray700,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.gray900,
  },

  // Column widths
  colTitle: { flex: 3 },
  colBU: { flex: 1 },
  colQty: { width: 36, textAlign: "right" },
  colUnit: { width: 72, textAlign: "right" },
  colDisc: { width: 42, textAlign: "right" },
  colSub: { width: 80, textAlign: "right" },

  // Totals
  totalsSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  totalLabel: {
    fontSize: 9,
    color: COLORS.gray500,
  },
  totalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.gray900,
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  totalFinalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
  },

  // Badges
  badge: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
  },
  badgeUrgency: {
    backgroundColor: "#FEF3C7",
  },
  badgeUrgencyText: {
    fontSize: 8,
    color: "#92400E",
    fontFamily: "Helvetica-Bold",
  },

  // Notes
  notesBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.gray700,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray400,
  },
  footerAccent: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
  },

  // Page number
  pageNumber: {
    fontSize: 8,
    color: COLORS.gray400,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ClientField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.clientField}>
      <Text style={styles.clientLabel}>{label}</Text>
      <Text style={styles.clientValue}>{value}</Text>
    </View>
  );
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

interface ProposalPDFTemplateProps {
  proposal: ProposalWithItems;
  logoBase64?: string;
}

export function ProposalPDFTemplate({ proposal, logoBase64 }: ProposalPDFTemplateProps) {
  const {
    items,
    name,
    ref_code,
    client,
    company,
    contact_name,
    contact_email,
    contact_phone,
    project_type,
    project_location,
    subtotal,
    discount_amount,
    value,
    notes,
    valid_days,
    urgency_flag,
    package_discount_flag,
    created_at,
  } = proposal;

  return (
    <Document
      title={`Proposta ${ref_code ?? name} — TBO`}
      author="TBO — The Branding Office"
      subject="Proposta Comercial"
      creator="TBO OS"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {logoBase64 ? (
              <Image src={logoBase64} style={{ width: 80, height: 24, objectFit: "contain" }} />
            ) : (
              <>
                <Text style={styles.brandName}>TBO</Text>
                <Text style={styles.brandTagline}>The Branding Office</Text>
              </>
            )}
          </View>
          <View style={styles.headerRight}>
            {ref_code && <Text style={styles.refCode}>{ref_code}</Text>}
            <Text style={styles.headerDate}>
              Emitida em {formatDate(created_at)}
            </Text>
            {valid_days > 0 && (
              <Text style={styles.headerDate}>
                Válida por {valid_days} dias
              </Text>
            )}
          </View>
        </View>

        {/* ── Proposal name banner ── */}
        <View style={styles.proposalBanner}>
          <Text style={styles.proposalBannerTitle}>{name}</Text>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            {project_type && (
              <Text style={styles.proposalBannerSub}>{project_type}</Text>
            )}
            {project_location && (
              <Text style={styles.proposalBannerSub}>• {project_location}</Text>
            )}
          </View>
        </View>

        {/* ── Client info ── */}
        <Text style={styles.sectionTitle}>Dados do Cliente</Text>
        <View style={styles.clientSection}>
          <View style={styles.clientGrid}>
            <ClientField label="Empresa" value={company ?? client} />
            <ClientField label="Contato" value={contact_name} />
            <ClientField label="E-mail" value={contact_email} />
            <ClientField label="Telefone" value={contact_phone} />
          </View>
        </View>

        {/* ── Items ── */}
        <Text style={styles.sectionTitle}>Escopo de Serviços</Text>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colTitle]}>Serviço</Text>
          <Text style={[styles.tableHeaderCell, styles.colBU]}>BU</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qtd</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnit]}>Valor unit.</Text>
          <Text style={[styles.tableHeaderCell, styles.colDisc]}>Desc.</Text>
          <Text style={[styles.tableHeaderCell, styles.colSub]}>Subtotal</Text>
        </View>

        {/* Table rows */}
        {items.map((item: ProposalItemRow, i: number) => (
          <View
            key={item.id}
            style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <View style={styles.colTitle}>
              <Text style={styles.tableCellBold}>{item.title}</Text>
              {item.description && (
                <Text style={[styles.tableCell, { marginTop: 2, color: COLORS.gray400 }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <Text style={[styles.tableCell, styles.colBU]}>{item.bu ?? "—"}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>
              {formatCurrency(item.unit_price)}
            </Text>
            <Text style={[styles.tableCell, styles.colDisc]}>
              {item.discount_pct > 0 ? `${item.discount_pct}%` : "—"}
            </Text>
            <Text style={[styles.tableCellBold, styles.colSub]}>
              {formatCurrency(item.subtotal)}
            </Text>
          </View>
        ))}

        {/* ── Badges (urgency / package) ── */}
        {(urgency_flag || package_discount_flag) && (
          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            {urgency_flag && (
              <View style={[styles.badge, styles.badgeUrgency]}>
                <Text style={styles.badgeUrgencyText}>⚡ URGÊNCIA APLICADA</Text>
              </View>
            )}
            {package_discount_flag && (
              <View style={[styles.badge, { backgroundColor: "#EDE9FE" }]}>
                <Text style={[styles.badgeUrgencyText, { color: "#4C1D95" }]}>
                  📦 DESCONTO PACOTE
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto</Text>
                <Text style={[styles.totalValue, { color: "#EF4444" }]}>
                  - {formatCurrency(discount_amount)}
                </Text>
              </View>
            )}
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Valor Total</Text>
              <Text style={styles.totalFinalValue}>{formatCurrency(value)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {notes && (
          <>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          </>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>
              TBO — The Branding Office · contato@agenciatbo.com.br
            </Text>
            <Text style={styles.footerText}>
              Esta proposta é válida por {valid_days} dias a partir da emissão.
            </Text>
          </View>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
