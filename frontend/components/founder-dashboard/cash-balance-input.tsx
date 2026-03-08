"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { useCashEntries, useCreateCashEntry } from "@/hooks/use-cash-entries";
import type { CashEntry } from "@/services/cash-entries";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function parseBRL(raw: string): number | null {
  // Accept "1.234.567,89" or "1234567.89" or "1234567,89"
  const cleaned = raw
    .replace(/[^\d,.-]/g, "")   // strip currency symbols, spaces
    .replace(/\.(?=\d{3}[,\.])/g, "") // remove thousands dots
    .replace(",", ".");          // normalise decimal separator
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HistoryRow({ entry }: { entry: CashEntry }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2 border-b border-gray-200 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {fmt(entry.amount)}
        </p>
        {entry.note && (
          <p className="text-xs text-gray-500 truncate">
            {entry.note}
          </p>
        )}
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
        {fmtDate(entry.recorded_at)}
      </span>
    </li>
  );
}

// ── AddEntryForm ──────────────────────────────────────────────────────────────

interface AddEntryFormProps {
  onClose: () => void;
  onSaved: (amount: number) => void;
}

function AddEntryForm({ onClose, onSaved }: AddEntryFormProps) {
  const [rawAmount, setRawAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useCreateCashEntry();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amount = parseBRL(rawAmount);
    if (amount === null || amount < 0) {
      setError("Informe um valor válido em reais (ex: 150.000,00).");
      return;
    }

    mutation.mutate(
      { amount, note: note.trim() || undefined },
      {
        onSuccess: (entry) => {
          onSaved(entry.amount);
          onClose();
        },
        onError: (err) => {
          setError(err.message ?? "Erro ao salvar entrada.");
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-3 p-3 rounded-lg bg-gray-100/40 border border-gray-200"
    >
      <div>
        <label
          htmlFor="cash-amount"
          className="block text-xs font-medium text-gray-900 mb-1"
        >
          Saldo atual (R$)
        </label>
        <input
          id="cash-amount"
          type="text"
          inputMode="numeric"
          placeholder="Ex: 150.000,00"
          value={rawAmount}
          onChange={(e) => setRawAmount(e.target.value)}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-tbo-orange/20 transition"
          required
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="cash-note"
          className="block text-xs font-medium text-gray-900 mb-1"
        >
          Observação (opcional)
        </label>
        <input
          id="cash-note"
          type="text"
          placeholder="Ex: Saldo consolidado Bradesco + Nubank"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-tbo-orange/20 transition"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-3 py-1.5 rounded-md text-sm font-semibold bg-tbo-orange hover:bg-tbo-orange/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {mutation.isPending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface CashBalanceInputProps {
  /** Called whenever a new balance is successfully saved */
  onBalanceChange?: (newAmount: number) => void;
  /** Max history rows to display (default 8) */
  historyLimit?: number;
  className?: string;
}

export function CashBalanceInput({
  onBalanceChange,
  historyLimit = 8,
  className = "",
}: CashBalanceInputProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: entries = [], isLoading } = useCashEntries(historyLimit);

  const latestEntry = entries[0] ?? null;

  // Notify parent whenever the latest entry changes
  useEffect(() => {
    if (latestEntry && onBalanceChange) {
      onBalanceChange(latestEntry.amount);
    }
  }, [latestEntry?.id, onBalanceChange]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaved(amount: number) {
    onBalanceChange?.(amount);
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      {/* Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-tbo-orange shrink-0" />
          <span className="text-sm font-semibold text-gray-900">
            Caixa Real
          </span>
        </div>

        <button
          onClick={() => {
            setFormOpen((v) => !v);
            if (historyOpen) setHistoryOpen(false);
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-tbo-orange hover:bg-tbo-orange/10 transition"
          title="Registrar novo saldo"
        >
          {formOpen ? (
            <>
              <X className="h-3.5 w-3.5" />
              Fechar
            </>
          ) : (
            <>
              <PlusCircle className="h-3.5 w-3.5" />
              Registrar
            </>
          )}
        </button>
      </div>

      {/* Current balance ─────────────────────────────────────────────────── */}
      <div className="mt-3">
        {isLoading ? (
          <div className="h-7 w-32 animate-pulse rounded bg-gray-100" />
        ) : latestEntry ? (
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {fmt(latestEntry.amount)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Registrado em {fmtDate(latestEntry.recorded_at)}
              {latestEntry.note && ` · ${latestEntry.note}`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Nenhum saldo registrado ainda.
          </p>
        )}
      </div>

      {/* Add form ────────────────────────────────────────────────────────── */}
      {formOpen && (
        <AddEntryForm
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* History toggle ─────────────────────────────────────────────────── */}
      {entries.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition"
          >
            {historyOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {historyOpen ? "Ocultar" : "Ver"} histórico ({entries.length}{" "}
            {entries.length === 1 ? "entrada" : "entradas"})
          </button>

          {historyOpen && (
            <ul className="mt-2">
              {entries.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
