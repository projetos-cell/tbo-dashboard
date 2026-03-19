import { StyleSheet, Font } from "@react-pdf/renderer";

// ─── Register fonts (system-safe) ─────────────────────────────────────────────

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

// ─── Color tokens ─────────────────────────────────────────────────────────────

export const colors = {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  muted: "#8a8a8a",
  accent: "#2563eb",
  border: "#e5e5e5",
  bgLight: "#f8f8f8",
  white: "#ffffff",
} as const;

// ─── Shared PDF styles ────────────────────────────────────────────────────────

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.primary,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    lineHeight: 1.6,
  },

  // Header / Logo area
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
    color: colors.primary,
  },
  headerMeta: {
    textAlign: "right",
    fontSize: 8,
    color: colors.muted,
  },

  // Section titles
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    color: colors.primary,
  },

  // Body text
  paragraph: {
    fontSize: 10,
    marginBottom: 6,
    textAlign: "justify",
    color: colors.secondary,
  },
  paragraphBold: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: colors.primary,
  },

  // Two-column layout
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  labelCol: {
    width: "35%",
    fontSize: 9,
    color: colors.muted,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueCol: {
    width: "65%",
    fontSize: 10,
    color: colors.primary,
  },

  // Table
  table: {
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgLight,
  },
  tableCell: {
    fontSize: 9,
    color: colors.secondary,
  },

  // Signature block
  signatureBlock: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  signatureItem: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    marginBottom: 6,
    height: 40,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
  signatureRole: {
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
    marginTop: 2,
  },
  signatureCpf: {
    fontSize: 7,
    color: colors.muted,
    textAlign: "center",
    marginTop: 1,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
  footerPage: {
    fontSize: 7,
    color: colors.muted,
  },

  // Highlight box
  highlightBox: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
  },

  // Inline pair
  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inlineLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  inlineValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
  },
});
