import { NextRequest, NextResponse } from "next/server";

// ── Constants ───────────────────────────────────────────────────────────────
const SHEET_ID = "1hmU6k-9W4Qaj76_tYjGyTc9FZUTvXIOBbWGi3iUn5v4";
const GID = "1980905846";

// Google Visualization API — works for sheets shared with "anyone with link"
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

// ── CSV Parsing ─────────────────────────────────────────────────────────────

/** Parse a CSV line handling quoted fields with commas inside */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Parse BRL value like "R$12.000" or "R$12.000,00" or "R$ 12.000" → number */
function parseBRL(raw: string): number {
  if (!raw || raw === "-" || raw === "—") return 0;
  const cleaned = raw
    .replace(/R\$\s*/gi, "")
    .replace(/\./g, "")    // remove thousands separator
    .replace(",", ".")     // decimal separator → dot
    .replace(/[^\d.-]/g, "")
    .trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface SheetTeamMember {
  name: string;
  role: string;
  salary: number;
  section: string; // "pessoas" | "vendas" | "other"
}

export interface SheetPayrollResponse {
  members: SheetTeamMember[];
  totalFolha: number;
  totalDespesas: number;
  headcount: number;
  month: string;
  year: number;
}

// ── GET Handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2026-03"

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Query param 'month' required (format: YYYY-MM)" },
      { status: 400 }
    );
  }

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr);
  const monthIdx = parseInt(monthStr); // 1-12

  if (monthIdx < 1 || monthIdx > 12) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  try {
    const res = await fetch(CSV_URL, {
      headers: { Accept: "text/csv" },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Sheets returned ${res.status}` },
        { status: 502 }
      );
    }

    const csv = await res.text();
    const lines = csv.split("\n").filter((l) => l.trim());

    // Find salary rows — any row where column A starts with "Salário"
    const members: SheetTeamMember[] = [];
    let totalDespesas = 0;
    let currentSection = "";

    for (const line of lines) {
      const cols = parseCsvLine(line);
      const label = (cols[0] ?? "").replace(/^"|"$/g, "").trim();

      // Track sections
      if (label === "Despesas de Pessoas") {
        currentSection = "pessoas";
        totalDespesas = parseBRL(cols[monthIdx] ?? "");
        continue;
      }
      if (label === "Despesas de Área de Vendas") {
        currentSection = "vendas";
        continue;
      }
      if (
        label.startsWith("Despesas de") ||
        label === "Resultados" ||
        label === "Despesa Total"
      ) {
        currentSection = "other";
        continue;
      }

      // Extract salary rows
      if (label.startsWith("Salário") || label.startsWith("Salario")) {
        const salary = parseBRL(cols[monthIdx] ?? "");
        // Parse "Salário Name | Role" or "Salário Name"
        const withoutPrefix = label
          .replace(/^Sal[aá]rio\s+/i, "")
          .trim();
        const parts = withoutPrefix.split("|").map((s) => s.trim());
        const name = parts[0] || "Desconhecido";
        const role = parts[1] || "";

        members.push({
          name,
          role,
          salary,
          section: currentSection || "other",
        });
      }
    }

    const totalFolha = members.reduce((sum, m) => sum + m.salary, 0);
    const headcount = members.filter((m) => m.salary > 0).length;

    const payload: SheetPayrollResponse = {
      members,
      totalFolha,
      totalDespesas,
      headcount,
      month,
      year,
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
