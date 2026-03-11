// ── Structured logger for sync-omie pipeline ────────────────────────────────
// Outputs JSON lines for Vercel / Datadog / any log aggregator.
// Drop-in replacement for console.log/warn/error with context enrichment.

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  msg: string;
  module: string;
  [key: string]: unknown;
}

function emit(entry: LogEntry): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });

  switch (entry.level) {
    case "error":
      // eslint-disable-next-line no-console
      console.error(line);
      break;
    case "warn":
      // eslint-disable-next-line no-console
      console.warn(line);
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(line);
  }
}

export interface SyncLogger {
  info: (msg: string, extra?: Record<string, unknown>) => void;
  warn: (msg: string, extra?: Record<string, unknown>) => void;
  error: (msg: string, extra?: Record<string, unknown>) => void;
  debug: (msg: string, extra?: Record<string, unknown>) => void;
}

/** Create a scoped logger for a sync module */
export function createSyncLogger(module: string): SyncLogger {
  const make =
    (level: LogLevel) =>
    (msg: string, extra?: Record<string, unknown>): void => {
      emit({ level, msg, module, ...extra });
    };

  return {
    info: make("info"),
    warn: make("warn"),
    error: make("error"),
    debug: make("debug"),
  };
}
