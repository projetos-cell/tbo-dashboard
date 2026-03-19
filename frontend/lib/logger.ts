// ── Client-side structured logger ────────────────────────────────────────────
// Replaces raw console.log/error in client code.
// In production, outputs JSON lines; in dev, uses standard console.

type LogLevel = "info" | "warn" | "error" | "debug";

function emit(level: LogLevel, module: string, msg: string, extra?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") {
    const line = JSON.stringify({ ts: new Date().toISOString(), level, module, msg, ...extra });
    switch (level) {
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
  } else {
    // Dev: readable output
    const prefix = `[${module}]`;
    switch (level) {
      case "error":
        // eslint-disable-next-line no-console
        console.error(prefix, msg, extra ?? "");
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(prefix, msg, extra ?? "");
        break;
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(prefix, msg, extra ?? "");
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(prefix, msg, extra ?? "");
    }
  }
}

export interface Logger {
  info: (msg: string, extra?: Record<string, unknown>) => void;
  warn: (msg: string, extra?: Record<string, unknown>) => void;
  error: (msg: string, extra?: Record<string, unknown>) => void;
  debug: (msg: string, extra?: Record<string, unknown>) => void;
}

export function createLogger(module: string): Logger {
  const make =
    (level: LogLevel) =>
    (msg: string, extra?: Record<string, unknown>): void => {
      emit(level, module, msg, extra);
    };

  return {
    info: make("info"),
    warn: make("warn"),
    error: make("error"),
    debug: make("debug"),
  };
}
