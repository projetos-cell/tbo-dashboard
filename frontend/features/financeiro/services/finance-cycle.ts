/**
 * finance-cycle.ts
 * Ciclo financeiro da TBO: dia 15 ao dia 14 do mês seguinte.
 *
 * O mês financeiro da TBO vai do dia 15 de um mês ao dia 14 do próximo.
 * Ex: "Março 2026" financeiro = 15/02/2026 a 14/03/2026.
 * Pagamento da equipe no dia 15 — clientes pagam até essa data.
 */

/** Day of month that starts the TBO financial cycle */
export const CYCLE_START_DAY = 15;

/**
 * Returns the TBO financial month range for a given reference date.
 * The "current month" runs from day 15 of the previous calendar month
 * to day 14 of the current calendar month.
 *
 * @example
 * getTBOMonthRange(new Date('2026-03-19'))
 * // → { from: '2026-03-15', to: '2026-04-14', label: 'Mar 2026' }
 *
 * getTBOMonthRange(new Date('2026-03-10'))
 * // → { from: '2026-02-15', to: '2026-03-14', label: 'Fev 2026' }
 */
export function getTBOMonthRange(refDate: Date = new Date()): {
  from: string;
  to: string;
  label: string;
  /** The financial "month" label in YYYY-MM format (based on the start date) */
  month: string;
} {
  const y = refDate.getFullYear();
  const m = refDate.getMonth(); // 0-based
  const d = refDate.getDate();

  let startYear: number;
  let startMonth: number;

  if (d >= CYCLE_START_DAY) {
    // We're in the cycle that started on the 15th of this month
    startYear = y;
    startMonth = m;
  } else {
    // We're in the cycle that started on the 15th of last month
    if (m === 0) {
      startYear = y - 1;
      startMonth = 11;
    } else {
      startYear = y;
      startMonth = m - 1;
    }
  }

  // End is the 14th of the next month after start
  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear++;
  }

  const from = formatDate(startYear, startMonth, CYCLE_START_DAY);
  const to = formatDate(endYear, endMonth, CYCLE_START_DAY - 1);

  const labelDate = new Date(startYear, startMonth, CYCLE_START_DAY);
  const label = labelDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");

  return {
    from,
    to,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    month: `${startYear}-${String(startMonth + 1).padStart(2, "0")}`,
  };
}

/**
 * Returns the TBO financial month range for a specific YYYY-MM string.
 * The financial month "2026-03" runs from 2026-03-15 to 2026-04-14.
 */
export function getTBOMonthRangeFromString(monthStr: string): {
  from: string;
  to: string;
} {
  const [y, m] = monthStr.split("-").map(Number);
  const from = formatDate(y, m - 1, CYCLE_START_DAY);

  let endYear = y;
  let endMonth = m; // m is already 1-based, so next month
  if (endMonth > 12) {
    endMonth = 1;
    endYear++;
  }

  const to = formatDate(endYear, endMonth - 1, CYCLE_START_DAY - 1);
  return { from, to };
}

/**
 * Returns all TBO financial month ranges for a given year.
 * Used for period filters in the UI.
 */
export function getTBOYearPeriods(year: number): Array<{
  value: string;
  label: string;
  from: string;
  to: string;
}> {
  const periods: Array<{ value: string; label: string; from: string; to: string }> = [];

  for (let m = 0; m < 12; m++) {
    const refDate = new Date(year, m, CYCLE_START_DAY);
    const range = getTBOMonthRange(refDate);
    const mStr = String(m + 1).padStart(2, "0");
    periods.push({
      value: `m${mStr}`,
      label: range.label,
      from: range.from,
      to: range.to,
    });
  }

  return periods;
}

/**
 * Returns quarter ranges using TBO cycle (15-14).
 * Q1 = Jan 15 - Apr 14, Q2 = Apr 15 - Jul 14, etc.
 */
export function getTBOQuarterRange(year: number, quarter: 1 | 2 | 3 | 4): {
  from: string;
  to: string;
} {
  const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
  const endMonth = startMonth + 3;

  const from = formatDate(year, startMonth, CYCLE_START_DAY);

  let endYear = year;
  let endM = endMonth;
  if (endM > 11) {
    endM = endM - 12;
    endYear++;
  }

  const to = formatDate(endYear, endM, CYCLE_START_DAY - 1);
  return { from, to };
}

/**
 * Returns semester ranges using TBO cycle.
 * S1 = Jan 15 - Jul 14, S2 = Jul 15 - Jan 14
 */
export function getTBOSemesterRange(year: number, semester: 1 | 2): {
  from: string;
  to: string;
} {
  if (semester === 1) {
    return {
      from: formatDate(year, 0, CYCLE_START_DAY),  // Jan 15
      to: formatDate(year, 6, CYCLE_START_DAY - 1), // Jul 14
    };
  }
  return {
    from: formatDate(year, 6, CYCLE_START_DAY),      // Jul 15
    to: formatDate(year + 1, 0, CYCLE_START_DAY - 1), // Jan 14 next year
  };
}

/**
 * Returns full year range using TBO cycle.
 * Year = Jan 15 to Jan 14 next year.
 */
export function getTBOYearRange(year: number): {
  from: string;
  to: string;
} {
  return {
    from: formatDate(year, 0, CYCLE_START_DAY),      // Jan 15
    to: formatDate(year + 1, 0, CYCLE_START_DAY - 1), // Jan 14 next year
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
